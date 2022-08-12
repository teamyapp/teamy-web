import moment from 'moment';

import { PopChannel, chan, multi } from '@lib/csp/csp';
import { IdentityClient, getAccessToken } from '@lib/identity/Identity.client';
import { Connection } from '@lib/network/Connection';
import { WebSocketConnection } from '@lib/network/WebSocket.connection';

import { RemoteTaskFilter } from '@core/client/entity/filter';
import { RemoteTask } from '@core/client/entity/remoteTask';
import { InvitationClient } from '@core/client/invitation.client';
import { MessageClient } from '@core/client/message.client';
import { SprintClient } from '@core/client/sprint.client';
import { TaskClient } from '@core/client/task.client';
import { TeamClient } from '@core/client/team.client';
import { UserClient } from '@core/client/user.client';
import { TaskFilter } from '@core/entity/filters';
import {
    CreateInvitationInput,
    CreateMessageInput,
    CreateSprintInput,
    CreateTaskInput,
    CreateTeamInput,
    CreateUserInput,
    UpdateMessageInput,
    UpdateTaskInput,
    UpdateTeamInput,
    UpdateUserInput,
} from '@core/entity/input';
import { AppState } from '@core/storage/states/app.state';
import { toInt } from '@core/storage/states/parser';
import { SprintTaskRelationState } from '@core/storage/states/sprintTaskRelation.state';
import { TaskState } from '@core/storage/states/task.state';
import { TeamMemberState } from '@core/storage/states/teamMember.state';
import { UserLinkState } from '@core/storage/states/userLink.state';

import { LocalStore } from './localStore';
import { Mutation } from './mutation';
import {
    applyInvitationMutation,
    applyMessageMutation,
    applyTaskAwaitingForRelationMutation,
    applyTaskMutation,
    applyTeamMemberMutation,
    applyTeamMutation,
    applyUserMutation,
    deleteThread,
    mergeInvitation,
    mergeMessage,
    mergeSprint,
    mergeTask,
    mergeTeam,
    mergeUser,
    replaceTeamInvitations,
    replaceTeamMembers,
} from './stateMutators';

export class StateSyncer {
    private readonly connection: Connection;
    private readonly onMutationReceivedCh = chan<Mutation>();
    private readonly onMutationReceivedMulti = multi(this.onMutationReceivedCh);

    constructor(
        private webSocketEndpoint: string,
        private identityClient: IdentityClient,
        private localStore: LocalStore,
        private taskClient: TaskClient,
        private messageClient: MessageClient,
        private teamClient: TeamClient,
        private userClient: UserClient,
        private invitationClient: InvitationClient,
        private sprintClient: SprintClient,
    ) {
        const url = `${this.webSocketEndpoint}/real-time-state-sync/clients/connect`;
        this.connection = new WebSocketConnection(url, getAccessToken);
    }

    public onMutationReceived(): PopChannel<Mutation | undefined> {
        return this.onMutationReceivedMulti.copy();
    }

    public async ensureConnected(): Promise<void> {
        if (this.connection?.isConnected) {
            return;
        }

        const messageReceived = this.connection.onMessageReceived();
        (async () => {
            while (true) {
                const message = await messageReceived.pop();
                if (message === undefined) {
                    return;
                }

                const json = JSON.parse(message);
                console.log('JSON received: ', json);
                const mutation = Mutation.fromMutationPayload(json);
                console.log('Mutation received: ', mutation);
                await this.mutateState(mutation);
                this.onMutationReceivedCh.put(mutation);
            }
        })().then();
        await this.connection.connect();
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

        appState = mergeTeam(appState, remoteTeam);
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

        appState = mergeTeam(appState, remoteTeam);
        this.localStore.updateState(appState);
    }

    public async pullCurrentSprint() {
        let appState = this.localStore.getState();
        const currSprintId = appState.currSprintId;
        if (!currSprintId) {
            return;
        }

        const sprint = await this.sprintClient.getSprintWithTaskPreviews(
            `${currSprintId}`,
        );
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
        const members = await this.teamClient.getTeamMembers(`${teamId}`);
        let appState = this.localStore.getState();
        appState = replaceTeamMembers(appState, teamId, members);
        members.forEach((member) => {
            appState = mergeUser(appState, member);
        });

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

        // TODO: dedupe with real time team member mutation
        const userId = appState.currUserId;
        const teamId = toInt(remoteTeam.id)!;
        appState.teamMembers.push(new TeamMemberState(teamId, userId!));
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

    public async addTeamMember(teamId: number, userId: number): Promise<void> {
        const remoteMember = await this.teamClient.addMemberToTeam(
            `${teamId}`,
            `${userId}`,
        );

        // TODO: dedupe with real time team member mutation
        let appState = this.localStore.getState();
        appState = mergeUser(appState, remoteMember);
        appState.teamMembers.push(new TeamMemberState(teamId, userId));
        this.localStore.updateState(appState);
    }

    public async createTask(
        teamId: number,
        task: CreateTaskInput,
        sprintId?: number,
    ): Promise<void> {
        let isPlanned: boolean | undefined;
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
            effort: input.effort,
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
        let currInProgressTask = findInProgressTask(
            appState,
            appState.currUserId!,
            appState.currTeamId!,
        );
        if (currInProgressTask) {
            currInProgressTask.status = 'PAUSED';
        }

        const task = appState.tasks[taskId];
        task.status = 'IN_PROGRESS';
        task.ownerUserId = appState.currUserId;

        // Responsive UI for drag & drop
        this.localStore.updateState(appState);

        const remoteTask = await this.taskClient.moveTaskToInProgress(
            `${taskId}`,
        );
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
                task.status = 'UPCOMING';
        }

        // Responsive UI for drag & drop
        this.localStore.updateState(appState);

        const remoteTask = await this.taskClient.moveTaskToUpcoming(
            `${taskId}`,
        );
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

    public async createSprint(
        teamId: number,
        sprint: CreateSprintInput,
    ): Promise<number> {
        const remoteSprint = await this.sprintClient.createSprint(`${teamId}`, {
            startAt: sprint.startAt,
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
                this._updateTaskSprint(
                    appState,
                    remoteTask,
                    fromSprintId,
                    toSprintId,
                ),
            this.localStore.getState(),
        );
        this.localStore.updateState(appState);
    }

    private _updateTaskSprint(
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

        const relation: SprintTaskRelationState = {
            sprintId: toSprintId,
            taskId,
        };
        appState.sprintTaskRelations =
            appState.sprintTaskRelations.concat(relation);
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
        const relation: SprintTaskRelationState = { sprintId, taskId };
        appState.sprintTaskRelations =
            appState.sprintTaskRelations.concat(relation);
        return appState;
    }

    private async mutateState(mutation: Mutation) {
        let appState = this.localStore.getState();
        switch (mutation.collectionType) {
            case 'Task': {
                appState = applyTaskMutation(appState, mutation);
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
                    this.teamClient,
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
