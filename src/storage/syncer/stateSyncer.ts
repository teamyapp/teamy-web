import moment from 'moment';

import { PopChannel, chan, multi } from '@lib/csp/csp';
import { Duration } from '@lib/entity/duration';
import { IdentityClient, getAccessToken } from '@lib/identity/Identity.client';
import { Connection } from '@lib/network/Connection';
import { WebSocketConnection } from '@lib/network/WebSocket.connection';

import { AppClient } from '@core/client/app.client';
import { AppVersionClient } from '@core/client/appVersion.client';
import { RemoteTaskFilter } from '@core/client/entity/filter';
import { RemoteRolloutActivator } from '@core/client/entity/remoteRolloutActivator';
import { RemoteTask } from '@core/client/entity/remoteTask';
import { InvitationClient } from '@core/client/invitation.client';
import { MessageClient } from '@core/client/message.client';
import { SprintClient } from '@core/client/sprint.client';
import { TaskClient } from '@core/client/task.client';
import { TeamClient } from '@core/client/team.client';
import { TeamMemberClient } from '@core/client/teamMember.client';
import { UserClient } from '@core/client/user.client';
import { TaskFilter } from '@core/entity/filters';
import {
    CreateActivatorInput,
    CreateAppInput,
    CreateAppRolloutInput,
    CreateAppSecretInput,
    CreateFilterGroupInput,
    CreateInvitationInput,
    CreateMessageInput,
    CreateSprintInput,
    CreateStaticGroupInput,
    CreateTaskInput,
    CreateTeamInput,
    CreateUserInput,
    CreateVersionSelectorInput,
    UpdateActivatorInput,
    UpdateAppSecretInput,
    UpdateAppVersionInput,
    UpdateGroupInput,
    UpdateMessageInput,
    UpdateRolloutInput,
    UpdateTaskInput,
    UpdateTeamInput,
    UpdateTeamMemberInput,
    UpdateUserInput,
    UpdateVersionSelectorInput,
} from '@core/entity/input';
import { AppState } from '@core/storage/states/app.state';
import { toDate, toInt } from '@core/storage/states/parser';
import { SprintTaskRelationState } from '@core/storage/states/sprintTaskRelation.state';
import { TaskState } from '@core/storage/states/task.state';
import { TeamMemberState } from '@core/storage/states/teamMember.state';
import { UserLinkState } from '@core/storage/states/userLink.state';

import { LocalStore } from './localStore';
import { Message } from './message';
import { Metadata } from './metadata';
import {
    applyAppVersionChangeMutation,
    applyAppVersionMutation,
    applyInvitationMutation,
    applyMessageMutation,
    applySprintMutation,
    applySprintParticipantMutation,
    applySprintTaskMutation,
    applyTaskActivityMutation,
    applyTaskAwaitingForRelationMutation,
    applyTaskLinkMutation,
    applyTaskMutation,
    applyTeamMemberMutation,
    applyTeamMutation,
    applyUserMutation,
    deleteThread,
    mergeActivator,
    mergeApp,
    mergeAppInstallation,
    mergeAppRolloutRelation,
    mergeAppSecret,
    mergeAppVersion,
    mergeGroup,
    mergeGroupRolloutRelation,
    mergeInvitation,
    mergeMessage,
    mergeRollout,
    mergeSprint,
    mergeTag,
    mergeTask,
    mergeTeam,
    mergeUser,
    mergeVersionSelector,
    removeOrMergeTeamMembers,
    replaceTeamInvitations,
    replaceTeamTaskActivities,
} from './stateMutators';
import { StateSyncClient } from './stateSyncClient';
import { Transaction } from './transaction';

export class StateSyncer {
    private readonly connection: Connection;
    private readonly onTransactionReceivedCh = chan<Transaction>();
    private readonly onTransactionReceivedMulti = multi(
        this.onTransactionReceivedCh,
    );

    private metadataReceived = false;

    constructor(
        private stateSyncClient: StateSyncClient,
        private webSocketEndpoint: string,
        private identityClient: IdentityClient,
        private localStore: LocalStore,
        private appClient: AppClient,
        private taskClient: TaskClient,
        private messageClient: MessageClient,
        private teamClient: TeamClient,
        private teamMemberClient: TeamMemberClient,
        private userClient: UserClient,
        private appVersionClient: AppVersionClient,
        private invitationClient: InvitationClient,
        private sprintClient: SprintClient,
    ) {
        const url = `${this.webSocketEndpoint}/real-time-state-sync/clients/connect`;
        this.connection = new WebSocketConnection(url, getAccessToken);
    }

    public async notifyInitialStateReceived() {
        if (!this.metadataReceived) {
            return;
        }

        let appState = this.localStore.getState();
        if (!appState.currClientId) {
            return;
        }

        return this.stateSyncClient.sendInitialStateIsReady(
            appState.currClientId,
        );
    }

    public onTransactionReceived(): PopChannel<Transaction | undefined> {
        return this.onTransactionReceivedMulti.copy();
    }

    public async ensureConnected(): Promise<void> {
        if (this.connection?.isConnected) {
            return;
        }

        const messageReceived = this.connection.onMessageReceived();
        await this.connection.connect();
        await new Promise(async (resolve) => {
            while (true) {
                const receivedMessage = await messageReceived.pop();
                if (receivedMessage === undefined) {
                    resolve(null);
                    return;
                }

                const json = JSON.parse(receivedMessage);
                console.log('JSON received: ', json);
                const message = Message.fromMutationPayload(json);
                console.log('Message received: ', message);
                switch (message.type) {
                    case 'Transaction': {
                        if (!this.metadataReceived) {
                            break;
                        }
                        const transaction = Transaction.fromTransactionPayload(
                            message.payload,
                        );

                        await this.mutateState(transaction);
                        this.onTransactionReceivedCh.put(transaction);
                        break;
                    }
                    case 'Metadata': {
                        await this.updateMetadataState(
                            Metadata.fromMutationPayload(message.payload),
                        );
                        this.metadataReceived = true;
                        resolve(null);
                        break;
                    }
                }
            }
        });
    }

    public trySetCurrentTeam(currTeamId: number): boolean {
        let appState = this.localStore.getState();
        if (!appState.currUserId) {
            return false;
        }

        const match = appState.teamMembers.filter(
            (teamMember) =>
                teamMember.userId === appState.currUserId &&
                teamMember.teamId === currTeamId,
        );
        if (match.length === 0) {
            appState.currTeamId = undefined;
            this.localStore.updateState(appState);
            return false;
        }

        appState.currTeamId = currTeamId;
        appState.currSprintId = appState.teamSelectedSprint[currTeamId];
        this.localStore.updateState(appState);
        return true;
    }

    public trySetCurrentSprint(currSprintId: number): boolean {
        let appState = this.localStore.getState();
        if (!appState.currTeamId) {
            return false;
        }

        if (!appState.sprints[currSprintId]) {
            return false;
        }

        appState.currSprintId = currSprintId;
        appState.teamSelectedSprint[appState.currTeamId] = currSprintId;
        this.localStore.updateState(appState);
        return true;
    }

    public async pullCurrentUser(): Promise<void> {
        const remoteUser = await this.userClient.getMe();
        let appState = this.localStore.getState();
        if (remoteUser) {
            appState = mergeUser(appState, remoteUser);
        }

        appState.currUserId = toInt(remoteUser?.id);
        this.localStore.updateState(appState);
    }

    public async pullCurrentUserWithTeams(): Promise<void> {
        const remoteUser = await this.userClient.getMeWithTeams();
        let appState = this.localStore.getState();
        if (remoteUser) {
            appState = mergeUser(appState, remoteUser);
        }

        appState.currUserId = toInt(remoteUser?.id);
        this.localStore.updateState(appState);
    }

    public async pullUserLinks() {
        const userLinks = await this.identityClient.listUserLinks();
        let appState = this.localStore.getState();
        appState.userLinks = userLinks.map((userLinkJson) =>
            UserLinkState.fromJson(userLinkJson),
        );
        this.localStore.updateState(appState);
    }

    public async pullCurrentTeam(): Promise<void> {
        let appState = this.localStore.getState();
        const currTeamId = appState.currTeamId;
        if (!currTeamId) {
            return;
        }

        const remoteTeam = await this.teamClient.getTeamWithSprintPreviews(
            `${currTeamId}`,
        );
        if (!remoteTeam) {
            return;
        }

        appState = this.localStore.getState();
        appState = mergeTeam(appState, remoteTeam);

        if (remoteTeam.taskActivities?.length) {
            appState = replaceTeamTaskActivities(
                appState,
                currTeamId,
                remoteTeam.taskActivities,
            );
        }

        if (remoteTeam.sprints) {
            const startOfDay = moment(Date.now()).startOf('day').utc().toDate();
            const startOfDayMilli = startOfDay.getTime();
            const activeSprint = remoteTeam.sprints.filter(
                (sprint) =>
                    new Date(sprint.startAt).getTime() <= startOfDayMilli &&
                    startOfDayMilli <= new Date(sprint.endAt).getTime(),
            )[0];
            if (activeSprint) {
                mergeSprint(appState, activeSprint);
                if (!appState.teamSelectedSprint[currTeamId]) {
                    appState.teamSelectedSprint[currTeamId] = parseInt(
                        activeSprint.id,
                    );

                    if (!appState.currSprintId) {
                        appState.currSprintId =
                            appState.teamSelectedSprint[currTeamId];
                    }
                }
            }
        }

        this.localStore.updateState(appState);
        await this.pullCurrentSprint();
    }

    public async pullCurrentTeamTaskPreview(filter?: TaskFilter) {
        let appState = this.localStore.getState();
        const currTeamId = appState.currTeamId;
        if (!currTeamId) {
            return;
        }

        let remoteFilter: RemoteTaskFilter | undefined;
        if (filter) {
            remoteFilter = {
                goalContains: filter.goalContains,
                isPlanned: filter.isPlanned,
                ownerId: filter.ownerId ? `${filter.ownerId}` : undefined,
                status: filter.status,
                taskId: filter.taskId ? `${filter.taskId}` : undefined,
            };
        }
        const remoteTeam = await this.teamClient.getTeamWithTaskPreviews(
            `${currTeamId}`,
            remoteFilter,
        );
        appState = this.localStore.getState();
        appState = mergeTeam(appState, remoteTeam);
        this.localStore.updateState(appState);
    }

    public async pullCurrentSprint() {
        let appState = this.localStore.getState();
        const currSprintId = appState.currSprintId;
        if (!currSprintId) {
            return;
        }

        await this.pullSprint(currSprintId);
    }

    public async pullSprint(sprintId: number) {
        const sprint = await this.sprintClient.getSprintWithTaskPreviews(
            `${sprintId}`,
        );
        let appState = this.localStore.getState();
        if (sprint) {
            appState = mergeSprint(appState, sprint);
        } else {
            delete appState.currSprintId;
        }

        this.localStore.updateState(appState);
    }

    public async pullCurrentTeamMembers(): Promise<void> {
        let appState = this.localStore.getState();
        if (!appState.currTeamId) {
            return;
        }

        await this.pullTeamMembers(appState.currTeamId);
    }

    public async pullTeamMembers(teamId: number): Promise<void> {
        const members = await this.teamMemberClient.getTeamMembers(`${teamId}`);
        let appState = this.localStore.getState();
        appState = removeOrMergeTeamMembers(appState, teamId, members);
        this.localStore.updateState(appState);
    }

    public async pullTask(taskId: number): Promise<void> {
        const remoteTask = await this.taskClient.getTask(`${taskId}`);
        if (remoteTask) {
            let appState = this.localStore.getState();
            appState = mergeTask(appState, remoteTask);
            this.localStore.updateState(appState);
        }
    }

    public async pullInvitationWithCode(
        invitationId: number,
        invitationCode: string,
    ) {
        const invitation = await this.invitationClient.getInvitation(
            `${invitationId}`,
            invitationCode,
        );

        let appState = this.localStore.getState();
        appState = mergeInvitation(appState, invitation);
        this.localStore.updateState(appState);
    }

    public async pullTeamInvitations(teamId: number): Promise<void> {
        const invitations = await this.invitationClient.getInvitations(
            `${teamId}`,
        );

        let appState = this.localStore.getState();
        appState = replaceTeamInvitations(appState, teamId, invitations);
        this.localStore.updateState(appState);
    }

    public async createTeam(team: CreateTeamInput): Promise<void> {
        const remoteTeam = await this.teamClient.createTeam(team);
        let appState = this.localStore.getState();
        appState = mergeTeam(appState, remoteTeam);
        this.localStore.updateState(appState);
    }

    public async updateTeam(
        teamId: number,
        input: UpdateTeamInput,
    ): Promise<void> {
        const remoteTeam = await this.teamClient.updateTeam(`${teamId}`, {
            name: input.name,
            iconUrl: input.iconUrl,
            ownerUserId: `${input.ownerUserId}`,
        });

        let appState = this.localStore.getState();
        appState = mergeTeam(appState, remoteTeam);
        this.localStore.updateState(appState);
    }

    public async updateTeamActiveSprint(teamId: number, sprintId: number) {
        const remoteTeam = await this.teamClient.updateTeamActiveSprint(
            `${teamId}`,
            `${sprintId}`,
        );

        let appState = this.localStore.getState();
        appState = mergeTeam(appState, remoteTeam);
        this.localStore.updateState(appState);
    }

    public async deleteTeam(teamId: number) {
        await this.teamClient.deleteTeam(`${teamId}`);
    }

    public async startDraggingTask(
        taskId: number,
    ): Promise<string | undefined> {
        let appState = this.localStore.getState();
        if (!appState.currClientId) {
            return;
        }

        return this.taskClient.startDraggingTask(
            `${taskId}`,
            `${appState.currClientId}`,
        );
    }

    public async stopDraggingTask(taskId: number): Promise<string | undefined> {
        let appState = this.localStore.getState();
        if (!appState.currClientId) {
            return;
        }

        return this.taskClient.stopDraggingTask(
            `${taskId}`,
            `${appState.currClientId}`,
        );
    }

    public async updateTeamMember(
        teamId: number,
        input: UpdateTeamMemberInput,
    ): Promise<void> {
        const remoteTeamMember = await this.teamMemberClient.updateTeamMember(
            `${teamId}`,
            {
                userId: `${input.userId}`,
                weeklyBandwidth: input.weeklyBandwidth.toString(),
            },
        );
        const appState = this.localStore.getState();
        appState.teamMembers = appState.teamMembers.map((teamMember) => {
            if (
                teamMember.teamId !== teamId ||
                teamMember.userId !== input.userId
            ) {
                return teamMember;
            }

            return new TeamMemberState(
                teamId,
                input.userId,
                Duration.fromString(remoteTeamMember.weeklyBandwidth),
                toDate(remoteTeamMember.createdAt)!,
                toDate(remoteTeamMember.updatedAt),
            );
        });
        this.localStore.updateState(appState);
    }

    public async createTask(
        teamId: number,
        task: CreateTaskInput,
        sprintId?: number,
    ): Promise<void> {
        let isPlanned = false;
        if (sprintId) {
            isPlanned = true;
        }

        const remoteTask = await this.taskClient.createTask(`${teamId}`, {
            goal: task.goal,
            context: task.context,
            ownerUserId: task.ownerUserId ? `${task.ownerUserId}` : undefined,
            dueAt: task.dueAt,
            isPlanned: isPlanned,
        });

        const remoteTaskId = parseInt(remoteTask.id);
        let appState = this.localStore.getState();
        appState = mergeTask(appState, remoteTask);
        if (sprintId) {
            appState = await this._addTaskToSprint(sprintId, remoteTaskId);
        }

        this.localStore.updateState(appState);
    }

    public async updateTask(taskId: number, input: UpdateTaskInput) {
        const remoteTask = await this.taskClient.updateTask(`${taskId}`, {
            goal: input.goal,
            context: input.context,
            ownerUserId: input.ownerUserId ? `${input.ownerUserId}` : undefined,
            owningTeamId: `${input.owningTeamId}`,
            effort: input.effort?.toString(),
            priority: input.priority,
            dueAt: input.dueAt,
        });

        let appState = this.localStore.getState();
        appState = mergeTask(appState, remoteTask);
        this.localStore.updateState(appState);
    }

    public async deleteTask(taskId: number) {
        let appState = this.localStore.getState();
        const deletedThreadId = appState.tasks[taskId].commentsThreadId;
        appState = deleteThread(appState, deletedThreadId);
        appState.taskAwaitForRelations = appState.taskAwaitForRelations.filter(
            (relation) =>
                relation.awaitingTaskId !== taskId &&
                relation.awaitForTaskId !== taskId,
        );
        appState.sprintTaskRelations = appState.sprintTaskRelations.filter(
            (relation) => relation.taskId !== taskId,
        );
        delete appState.tasks[taskId];
        this.localStore.updateState(appState);
        await this.taskClient.deleteTask(`${taskId}`);
    }

    public async moveTaskToInProgress(taskId: number) {
        let appState = this.localStore.getState();

        // TODO: only enable when at more 1 in progress task is turned on
        // let currInProgressTask = findInProgressTask(
        //     appState,
        //     appState.currUserId!,
        //     appState.currTeamId!,
        // );
        // if (currInProgressTask) {
        //     currInProgressTask.status = 'PAUSED';
        // }

        const task = appState.tasks[taskId];
        task.status = 'IN_PROGRESS';
        task.ownerUserId = appState.currUserId;

        // Responsive UI for drag & drop
        this.localStore.updateState(appState);

        const remoteTask = await this.taskClient.moveTaskToInProgress(
            `${taskId}`,
        );
        appState = this.localStore.getState();
        appState = mergeTask(appState, remoteTask);
        this.localStore.updateState(appState);
    }

    public async moveTaskToDelivered(taskId: number) {
        let appState = this.localStore.getState();
        const task = appState.tasks[taskId];
        task.status = 'IN_PROGRESS';

        // Responsive UI for drag & drop
        this.localStore.updateState(appState);

        const remoteTask = await this.taskClient.moveTaskToDelivered(
            `${taskId}`,
        );
        appState = this.localStore.getState();
        appState = mergeTask(appState, remoteTask);
        this.localStore.updateState(appState);
    }

    public async moveTaskToUpcoming(taskId: number) {
        let appState = this.localStore.getState();
        const task = appState.tasks[taskId];

        switch (task.status) {
            case 'IN_PROGRESS':
            case 'PAUSED':
                task.status = 'PAUSED';
                break;
            default:
                task.status = 'TODO';
        }

        // Responsive UI for drag & drop
        this.localStore.updateState(appState);

        const remoteTask = await this.taskClient.moveTaskToUpcoming(
            `${taskId}`,
        );
        appState = this.localStore.getState();
        appState = mergeTask(appState, remoteTask);
        this.localStore.updateState(appState);
    }

    public async createUser(user: CreateUserInput): Promise<void> {
        await this.userClient.createUser(user);
    }

    public async updateUser(
        userId: number,
        input: UpdateUserInput,
    ): Promise<void> {
        const remoteUser = await this.userClient.updateUser(`${userId}`, input);
        let appState = this.localStore.getState();
        appState = mergeUser(appState, remoteUser);
        this.localStore.updateState(appState);
    }

    public createUserProfileUpdateSession = async (): Promise<number> => {
        const remoteSessionID =
            await this.userClient.createUserProfileUploadSession();
        return parseInt(remoteSessionID);
    };

    public createAppPackageUploadSession = async (
        appId: number,
        versionNumber: number,
    ): Promise<number> => {
        const remoteSessionID =
            await this.appVersionClient.createAppPackageUploadSession(
                `${appId}`,
                versionNumber,
            );
        return parseInt(remoteSessionID);
    };

    public async finishUserProfileUpdateSession(
        fileUploadSessionId: number,
    ): Promise<void> {
        const remoteUser = await this.userClient.finishUserProfileUploadSession(
            `${fileUploadSessionId}`,
        );
        let appState = this.localStore.getState();
        appState = mergeUser(appState, remoteUser);
        this.localStore.updateState(appState);
    }

    public async finishAppPackageUploadSession(
        appId: number,
        versionNumber: number,
        fileUploadSessionId: number,
    ): Promise<void> {
        const remoteAppVersion =
            await this.appVersionClient.finishAppPackageUploadSession(
                `${appId}`,
                versionNumber,
                `${fileUploadSessionId}`,
            );

        let appState = this.localStore.getState();
        appState = mergeAppVersion(appState, appId, remoteAppVersion);
        this.localStore.updateState(appState);
    }

    public createTeamIconUpdateSession = async (
        teamId: number,
    ): Promise<number> => {
        const remoteSessionID =
            await this.teamClient.createTeamIconUploadSession(`${teamId}`);
        return parseInt(remoteSessionID);
    };

    public async finishTeamIconUpdateSession(
        teamId: number,
        fileUploadSessionId: number,
    ): Promise<void> {
        const remoteTeam = await this.teamClient.finishTeamIconUploadSession(
            `${teamId}`,
            `${fileUploadSessionId}`,
        );
        let appState = this.localStore.getState();
        appState = mergeTeam(appState, remoteTeam);
        this.localStore.updateState(appState);
    }

    public async createMessage(
        threadId: number,
        input: CreateMessageInput,
    ): Promise<void> {
        const message = await this.messageClient.createMessage(
            `${threadId}`,
            input,
        );

        let appState = this.localStore.getState();
        appState = mergeMessage(appState, message);
        this.localStore.updateState(appState);
    }

    public async updateMessage(
        messageId: number,
        input: UpdateMessageInput,
    ): Promise<void> {
        const message = await this.messageClient.updateMessage(
            `${messageId}`,
            input,
        );
        let appState = this.localStore.getState();
        appState = mergeMessage(appState, message);
        this.localStore.updateState(appState);
    }

    public async deleteMessage(messageId: number): Promise<void> {
        let appState = this.localStore.getState();
        delete appState.messages[messageId];
        this.localStore.updateState(appState);
        await this.messageClient.deleteMessage(`${messageId}`);
    }

    public async createInvitation(
        teamId: number,
        input: CreateInvitationInput,
    ): Promise<[invitationId: number, invitationCode: string]> {
        const invitation = await this.invitationClient.createInvitation(
            `${teamId}`,
            input,
        );
        let appState = this.localStore.getState();
        appState = mergeInvitation(appState, invitation);
        this.localStore.updateState(appState);
        return [toInt(invitation.id)!, invitation.code!];
    }

    public async acceptInvitation(
        invitationId: number,
        invitationCode: string,
    ): Promise<void> {
        const invitation = await this.invitationClient.acceptInvitation(
            `${invitationId}`,
            invitationCode,
        );
        let appState = this.localStore.getState();
        appState = mergeInvitation(appState, invitation);
        this.localStore.updateState(appState);
    }

    public async declineInvitation(
        invitationId: number,
        invitationCode: string,
    ) {
        await this.invitationClient.declineInvitation(
            `${invitationId}`,
            invitationCode,
        );
    }

    public async deleteInvitation(invitationId: number): Promise<void> {
        let appState = this.localStore.getState();
        delete appState.invitations[invitationId];
        this.localStore.updateState(appState);
        await this.invitationClient.deleteInvitation(`${invitationId}`);
    }

    public async removeMemberFromTeam(
        teamId: number,
        userId: number,
    ): Promise<void> {
        let appState = this.localStore.getState();
        appState.teamMembers = appState.teamMembers.filter(
            (teamMember) =>
                !(teamMember.teamId === teamId && teamMember.userId === userId),
        );
        this.localStore.updateState(appState);
        await this.teamMemberClient.removeMemberFromTeam(
            `${teamId}`,
            `${userId}`,
        );
    }

    public async createSprint(
        teamId: number,
        sprint: CreateSprintInput,
    ): Promise<number> {
        const remoteSprint = await this.sprintClient.createSprint(`${teamId}`, {
            startAt: sprint.startAt,
            endAt: sprint.endAt,
        });
        let appState = this.localStore.getState();
        appState = mergeSprint(appState, remoteSprint);
        this.localStore.updateState(appState);
        return parseInt(remoteSprint.id);
    }

    public async deleteSprint(sprintId: number): Promise<void> {
        let appState = this.localStore.getState();
        const sprint = appState.sprints[sprintId];
        delete appState.teamSelectedSprint[sprint.owningTeamId];
        const taskIds = appState.sprintTaskRelations
            .filter((relation) => relation.sprintId === sprintId)
            .map((relation) => relation.taskId);
        for (let taskId of taskIds) {
            appState = await this._removeTaskFromSprint(
                appState,
                sprintId,
                taskId,
            );
        }

        if (appState.currSprintId === sprintId) {
            appState.currSprintId = undefined;
        }

        delete appState.sprints[sprintId];
        this.localStore.updateState(appState);
        await this.sprintClient.deleteSprint(`${sprintId}`);
    }

    public async addTaskToSprint(sprintId: number, taskId: number) {
        const appState = await this._addTaskToSprint(sprintId, taskId);
        this.localStore.updateState(appState);
    }

    public async removeTaskFromSprint(sprintId: number, taskId: number) {
        let appState = this.localStore.getState();
        appState = await this._removeTaskFromSprint(appState, sprintId, taskId);
        this.localStore.updateState(appState);
    }

    public async copyTasksToSprint(toSprintId: number, taskIds: number[]) {
        await this.sprintClient.copyTasksToSprint(
            `${toSprintId}`,
            taskIds.map(String),
        );
    }

    public async moveTasksToSprint(
        fromSprintId: number,
        toSprintId: number,
        taskIds: number[],
    ) {
        const remoteTasks = await this.sprintClient.moveTasksToSprint(
            `${fromSprintId}`,
            `${toSprintId}`,
            taskIds.map(String),
        );

        const appState = remoteTasks.reduce(
            (appState, remoteTask) =>
                this._moveTaskToSprint(
                    appState,
                    remoteTask,
                    fromSprintId,
                    toSprintId,
                ),
            this.localStore.getState(),
        );
        this.localStore.updateState(appState);
    }

    public async createApp(
        teamId: number,
        input: CreateAppInput,
    ): Promise<void> {
        const remoteApp = await this.appClient.createApp(`${teamId}`, input);
        let appState = this.localStore.getState();
        appState = mergeApp(appState, remoteApp, teamId);
        this.localStore.updateState(appState);
    }

    public async installAppToTeam(appId: number, teamId: number) {
        const remoteInstallation = await this.appClient.installAppToTeam(
            `${appId}`,
            `${teamId}`,
        );
        let appState = this.localStore.getState();
        if (remoteInstallation.activeAppVersion?.app) {
            appState = mergeApp(
                appState,
                remoteInstallation.activeAppVersion.app,
            );
        }

        appState = mergeAppInstallation(appState, remoteInstallation);
        this.localStore.updateState(appState);
    }

    public async uninstallAppFromTeam(installationId: number) {
        await this.appClient.uninstallAppFromTeam(`${installationId}`);
        let appState = this.localStore.getState();
        const installation = appState.appInstallations[installationId];
        const app = appState.apps[installation.appId];
        app.totalInstallations -= 1;
        delete appState.appInstallations[installationId];
        this.localStore.updateState(appState);
    }

    public async getApps(teamId: number): Promise<void> {
        const remoteApps = await this.appClient.getApps(`${teamId}`);
        let appState = this.localStore.getState();
        appState = remoteApps.reduce(
            (appState, remoteApp) => mergeApp(appState, remoteApp),
            appState,
        );
        this.localStore.updateState(appState);
    }

    public async deleteApp(appId: number): Promise<void> {
        await this.appClient.deleteApp(`${appId}`);
        let appState = this.localStore.getState();

        for (let appSecretId of appState.apps[appId].secretIds) {
            delete appState.appSecrets[appSecretId];
        }

        for (let appInstallation in appState.appInstallations) {
            if (appState.appInstallations[appInstallation].appId === appId) {
                delete appState.appInstallations[appInstallation];
            }
        }

        appState.appGroupRelations
            .filter((relation) => relation.appId === appId)
            .forEach((relation) => {
                this._deleteGroup(appState, relation.groupId);
            });

        appState.appRolloutRelations
            .filter((relation) => relation.appId === appId)
            .forEach((relation) => {
                const rollout = appState.rollouts[relation.rolloutId];
                this._deleteRollout(
                    appState,
                    relation.rolloutId,
                    rollout.activatorId,
                    rollout.versionSelectorId,
                );
            });

        appState.teamAppVersions = appState.teamAppVersions.filter(
            (relation) => relation.appId !== appId,
        );
        delete appState.apps[appId];
        this.localStore.updateState(appState);
    }

    public async createAppSecret(
        appId: number,
        secret: CreateAppSecretInput,
    ): Promise<void> {
        const remoteAppSecret = await this.appClient.createAppSecret(
            `${appId}`,
            secret,
        );
        let appState = this.localStore.getState();
        appState = mergeAppSecret(appState, remoteAppSecret);
        const app = appState.apps[appId];
        const secretId = toInt(remoteAppSecret.id);
        if (!secretId) {
            return;
        }

        app.secretIds.push(secretId);
        this.localStore.updateState(appState);
    }

    public async updateAppSecret(
        secretId: number,
        secret: UpdateAppSecretInput,
    ): Promise<void> {
        const remoteAppSecret = await this.appClient.updateAppSecret(
            `${secretId}`,
            secret,
        );
        let appState = this.localStore.getState();
        appState = mergeAppSecret(appState, remoteAppSecret);
        this.localStore.updateState(appState);
    }

    public async deleteAppSecret(
        appId: number,
        secretId: number,
    ): Promise<void> {
        await this.appClient.deleteAppSecret(`${secretId}`);
        let appState = this.localStore.getState();
        delete appState.appSecrets[secretId];
        const app = appState.apps[appId];
        app.secretIds = app.secretIds.filter((id) => id !== secretId);
        this.localStore.updateState(appState);
    }

    public async createAppVersion(appId: number): Promise<number> {
        const appVersion = await this.appVersionClient.createAppVersion(
            `${appId}`,
        );
        let appState = this.localStore.getState();
        appState = mergeAppVersion(appState, appId, appVersion);
        this.localStore.updateState(appState);
        return appVersion.number;
    }

    public async updateAppVersion(
        appId: number,
        versionNumber: number,
        input: UpdateAppVersionInput,
    ) {
        const remoteAppVersion = await this.appVersionClient.updateAppVersion(
            `${appId}`,
            versionNumber,
            input,
        );
        let appState = this.localStore.getState();
        appState = mergeAppVersion(appState, appId, remoteAppVersion);
        this.localStore.updateState(appState);
    }

    public async deleteAppVersion(
        appId: number,
        versionNumber: number,
    ): Promise<void> {
        await this.appVersionClient.deleteAppVersion(`${appId}`, versionNumber);
        let appState = this.localStore.getState();
        const app = appState.apps[appId];
        delete app.versions[versionNumber];
        this.localStore.updateState(appState);
    }

    public async addTagToApp(appId: number, tag: string): Promise<void> {
        const remoteTag = await this.appClient.addTagToApp(`${appId}`, tag);
        let appState = this.localStore.getState();
        const app = appState.apps[appId];
        const tagId = toInt(remoteTag.id);
        if (!tagId) {
            return;
        }

        app.tagIds.add(tagId);
        appState = mergeTag(appState, remoteTag);
        this.localStore.updateState(appState);
    }

    public async removeTagFromApp(appId: number, tagId: number): Promise<void> {
        await this.appClient.removeTagFromApp(`${appId}`, `${tagId}`);
        let appState = this.localStore.getState();
        const app = appState.apps[appId];
        app.tagIds.delete(tagId);
        this.localStore.updateState(appState);
    }

    public async createStaticUserGroup(
        appId: number,
        input: CreateStaticGroupInput,
    ): Promise<void> {
        const remoteGroup = await this.appClient.createStaticUserGroup(
            `${appId}`,
            {
                name: input.groupName,
                userIds: input.memberIds.map(String),
                rolloutIds: input.rolloutIds.map(String),
            },
        );

        let appState = this.localStore.getState();
        appState = mergeGroup(appState, remoteGroup, appId);
        this.localStore.updateState(appState);
    }

    public async createFilterGroup(
        appId: number,
        input: CreateFilterGroupInput,
    ): Promise<void> {
        const remoteGroup = await this.appClient.createFilterGroup(`${appId}`, {
            name: input.groupName,
            filter: input.filter,
            groupMemberType: input.groupMemberType,
            rolloutIds: input.rolloutIds.map(String),
        });

        let appState = this.localStore.getState();
        appState = mergeGroup(appState, remoteGroup, appId);
        this.localStore.updateState(appState);
    }

    public async createStaticTeamGroup(
        appId: number,
        input: CreateStaticGroupInput,
    ): Promise<void> {
        const remoteGroup = await this.appClient.createStaticTeamGroup(
            `${appId}`,
            {
                name: input.groupName,
                teamIds: input.memberIds.map(String),
                rolloutIds: input.rolloutIds.map(String),
            },
        );

        let appState = this.localStore.getState();
        appState = mergeGroup(appState, remoteGroup, appId);
        this.localStore.updateState(appState);
    }

    public async updateGroup(
        appId: number,
        groupId: number,
        input: UpdateGroupInput,
    ): Promise<void> {
        const remoteGroup = await this.appClient.updateGroup(
            `${appId}`,
            `${groupId}`,
            {
                name: input.name,
                type: input.type,
                groupMemberType: input.groupMemberType,
                memberIds: input.memberIds?.map(String) ?? [],
                rolloutIds: input.rolloutIds.map(String),
                filter: input.filter,
            },
        );
        let appState = this.localStore.getState();
        appState = this._deleteGroup(appState, groupId);
        appState = mergeGroup(appState, remoteGroup, appId);
        this.localStore.updateState(appState);
    }

    public async deleteGroup(groupId: number): Promise<void> {
        await this.appClient.deleteGroup(`${groupId}`);
        let appState = this.localStore.getState();
        appState = this._deleteGroup(appState, groupId);
        this.localStore.updateState(appState);
    }

    public async createAppRollout(
        appId: number,
        input: CreateAppRolloutInput,
    ): Promise<void> {
        const remoteRollout = await this.appClient.createAppRollout(
            `${appId}`,
            input.type,
            {
                name: input.name,
                activatorId: `${input.activatorId}`,
                versionSelectorId: `${input.versionSelectorId}`,
                isEnabled: input.isEnabled,
                groupIds: input.groupIds.map(String),
            },
        );

        let appState = this.localStore.getState();
        appState = mergeRollout(appState, remoteRollout);
        appState = mergeAppRolloutRelation(
            appState,
            appId,
            toInt(remoteRollout.id)!,
            input.type,
        );

        remoteRollout.groupRolloutRelations.forEach((relation) => {
            appState = mergeGroupRolloutRelation(
                appState,
                toInt(relation.group.id)!,
                toInt(remoteRollout.id)!,
                relation.orderIndex,
            );
        });

        this.localStore.updateState(appState);
    }

    public async updateRollout(input: UpdateRolloutInput) {
        const remoteRollout = await this.appClient.updateRollout(
            `${input.id}`,
            {
                name: input.name,
                activatorId: `${input.activatorId}`,
                versionSelectorId: `${input.versionSelectorId}`,
                isEnabled: input.isEnabled,
                groupIds: input.groupIds.map(String),
            },
        );

        let appState = this.localStore.getState();
        appState = mergeRollout(appState, remoteRollout);
        this.localStore.updateState(appState);
    }

    public async deleteRollout(rolloutId: number): Promise<void> {
        await this.appClient.deleteRollout(`${rolloutId}`);
        let appState = this.localStore.getState();
        const rollout = appState.rollouts[rolloutId];
        const activatorId = rollout.activatorId;
        const versionSelectorId = rollout.versionSelectorId;
        appState = this._deleteRollout(
            appState,
            rolloutId,
            activatorId,
            versionSelectorId,
        );

        this.localStore.updateState(appState);
    }

    private _deleteRollout(
        appState: AppState,
        rolloutId: number,
        activatorId: number,
        versionSelectorId: number,
    ): AppState {
        delete appState.rollouts[rolloutId];
        delete appState.activators[activatorId];
        delete appState.timeRangeActivators[activatorId];
        delete appState.maxViewersActivators[activatorId];
        delete appState.percentageActivators[activatorId];
        delete appState.versionSelectors[versionSelectorId];

        appState.versionSelectorVersionRelations =
            appState.versionSelectorVersionRelations.filter(
                (relation) => relation.versionSelectorId !== versionSelectorId,
            );

        appState.groupRolloutRelations = appState.groupRolloutRelations.filter(
            (relation) => relation.rolloutId !== rolloutId,
        );
        appState.appRolloutRelations = appState.appRolloutRelations.filter(
            (relation) => relation.rolloutId !== rolloutId,
        );

        return appState;
    }

    public async createActivator(input: CreateActivatorInput): Promise<number> {
        let remoteActivator: RemoteRolloutActivator;
        switch (input.type) {
            case 'STATIC': {
                remoteActivator = await this.appClient.createStaticActivator();
                break;
            }
            case 'MAX_VIEWERS': {
                remoteActivator =
                    await this.appClient.createMaxViewersActivator({
                        maxViewers: input.maxViewers,
                    });
                break;
            }
            case 'TIME_RANGE': {
                remoteActivator = await this.appClient.createTimeRangeActivator(
                    {
                        startAt: input.startAt,
                        endAt: input.endAt,
                    },
                );
                break;
            }
            case 'PERCENTAGE': {
                remoteActivator =
                    await this.appClient.createPercentageActivator({
                        percentage: input.percentage,
                    });
                break;
            }
        }

        let appState = this.localStore.getState();
        appState = mergeActivator(appState, remoteActivator);
        this.localStore.updateState(appState);
        return toInt(remoteActivator.id)!;
    }

    public async updateActivator(
        activatorId: number,
        input: UpdateActivatorInput,
    ): Promise<void> {
        const remoteActivator = await this.appClient.updateActivator(
            `${activatorId}`,
            input,
        );
        let appState = this.localStore.getState();
        delete appState.timeRangeActivators[activatorId];
        delete appState.maxViewersActivators[activatorId];
        delete appState.percentageActivators[activatorId];
        appState = mergeActivator(appState, remoteActivator);
        this.localStore.updateState(appState);
    }

    public async createVersionSelector(
        appId: number,
        input: CreateVersionSelectorInput,
    ): Promise<number> {
        let remoteVersionSelector;
        switch (input.type) {
            case 'STATIC': {
                remoteVersionSelector =
                    await this.appClient.createStaticVersionSelector(
                        `${appId}`,
                        {
                            versionNumber: input.versionNumber,
                        },
                    );
                break;
            }
            case 'EXPERIMENT': {
                remoteVersionSelector =
                    await this.appClient.createExperimentVersionSelector(
                        `${appId}`,
                        {
                            versionNumbers: input.versionNumbers,
                        },
                    );
                break;
            }
        }

        let appState = this.localStore.getState();
        appState = mergeVersionSelector(appState, remoteVersionSelector);
        this.localStore.updateState(appState);
        return toInt(remoteVersionSelector.id)!;
    }

    public async updateVersionSelector(
        appId: number,
        versionSelectorId: number,
        input: UpdateVersionSelectorInput,
    ): Promise<void> {
        const remoteVersionSelector =
            await this.appClient.updateVersionSelector(
                `${appId}`,
                `${versionSelectorId}`,
                {
                    type: input.type,
                    versionNumber: input.versionNumber,
                    versionNumbers: input.versionNumbers ?? [],
                },
            );
        let appState = this.localStore.getState();
        appState.versionSelectorVersionRelations =
            appState.versionSelectorVersionRelations.filter(
                (relation) => relation.versionSelectorId !== versionSelectorId,
            );

        appState = mergeVersionSelector(appState, remoteVersionSelector);
        this.localStore.updateState(appState);
    }

    private _deleteGroup(appState: AppState, groupId: number) {
        delete appState.groups[groupId];
        delete appState.filterGroups[groupId];

        appState.appGroupRelations = appState.appGroupRelations.filter(
            (relation) => relation.groupId !== groupId,
        );

        appState.groupRolloutRelations = appState.groupRolloutRelations.filter(
            (relation) => relation.groupId !== groupId,
        );

        appState.groupMemberRelations = appState.groupMemberRelations.filter(
            (relation) => relation.groupId !== groupId,
        );

        return appState;
    }

    private _moveTaskToSprint(
        appState: AppState,
        remoteTask: RemoteTask,
        fromSprintId: number,
        toSprintId: number,
    ): AppState {
        const taskId = toInt(remoteTask.id);
        if (taskId === undefined) {
            return appState;
        }

        appState = mergeTask(appState, remoteTask);
        appState.sprintTaskRelations = appState.sprintTaskRelations.filter(
            (relation) =>
                !(
                    relation.sprintId === fromSprintId &&
                    relation.taskId === taskId
                ),
        );

        return appState;
    }

    private async _removeTaskFromSprint(
        appState: AppState,
        sprintId: number,
        taskId: number,
    ): Promise<AppState> {
        const remoteTask = await this.sprintClient.removeTaskFromSprint(
            `${sprintId}`,
            `${taskId}`,
        );
        appState = mergeTask(appState, remoteTask);
        appState.sprintTaskRelations = appState.sprintTaskRelations.filter(
            (relation) =>
                !(relation.sprintId === sprintId && relation.taskId === taskId),
        );
        return appState;
    }

    private async _addTaskToSprint(
        sprintId: number,
        taskId: number,
    ): Promise<AppState> {
        const remoteTask = await this.sprintClient.addTaskToSprint(
            `${sprintId}`,
            `${taskId}`,
        );
        let appState = this.localStore.getState();
        appState = mergeTask(appState, remoteTask);

        if (
            appState.sprintTaskRelations.find(
                (sprintTaskRelationItem) =>
                    sprintTaskRelationItem.taskId === taskId &&
                    sprintTaskRelationItem.sprintId === sprintId,
            )
        ) {
            return appState;
        }

        const relation: SprintTaskRelationState = { sprintId, taskId };
        appState.sprintTaskRelations =
            appState.sprintTaskRelations.concat(relation);
        return appState;
    }

    private async updateMetadataState(metadata: Metadata) {
        let appState = this.localStore.getState();
        appState.currClientId = Number(metadata.clientId);
        this.localStore.updateState(appState);
    }

    private async mutateState(transaction: Transaction) {
        let appState = this.localStore.getState();
        for (const mutation of transaction.mutations) {
            switch (mutation.collectionType) {
                case 'AppVersion': {
                    appState = applyAppVersionMutation(appState, mutation);
                    break;
                }
                case 'AppVersionChange': {
                    appState = applyAppVersionChangeMutation(
                        appState,
                        mutation,
                    );
                    break;
                }
                case 'Sprint': {
                    appState = applySprintMutation(appState, mutation);
                    break;
                }
                case 'Task': {
                    appState = applyTaskMutation(appState, mutation);
                    break;
                }
                case 'TaskLink': {
                    appState = applyTaskLinkMutation(appState, mutation);
                    break;
                }
                case 'SprintTaskRelation': {
                    appState = applySprintTaskMutation(appState, mutation);
                    break;
                }
                case 'Invitation': {
                    appState = applyInvitationMutation(appState, mutation);
                    break;
                }
                case 'Message': {
                    appState = applyMessageMutation(appState, mutation);
                    break;
                }
                case 'Thread': {
                    break;
                }
                case 'Team': {
                    appState = applyTeamMutation(appState, mutation);
                    break;
                }
                case 'User': {
                    appState = applyUserMutation(appState, mutation);
                    break;
                }
                case 'TeamMember': {
                    appState = await applyTeamMemberMutation(
                        appState,
                        mutation,
                        this.teamMemberClient,
                    );
                    break;
                }
                case 'TaskAwaitForRelation': {
                    appState = applyTaskAwaitingForRelationMutation(
                        appState,
                        mutation,
                    );
                    break;
                }
                case 'TaskActivity': {
                    appState = applyTaskActivityMutation(appState, mutation);
                    break;
                }
                case 'SprintParticipant': {
                    appState = applySprintParticipantMutation(
                        appState,
                        mutation,
                    );
                    break;
                }
            }
        }

        this.localStore.updateState(appState);
    }
}

function findInProgressTask(
    appState: AppState,
    userId: number,
    teamId: number,
): TaskState | undefined {
    for (let taskId in appState.tasks) {
        const task = appState.tasks[taskId];
        if (
            task.owningTeamId === teamId &&
            task.ownerUserId === userId &&
            task.status === 'IN_PROGRESS'
        ) {
            return task;
        }
    }
}
