import { PopChannel, chan, multi } from '@lib/csp/csp';
import { IdentityClient } from '@lib/identity/Identity.client';
import { Connection } from '@lib/network/Connection';
import { WebSocketConnection } from '@lib/network/WebSocket.connection';

import { InvitationClient } from '@core/client/invitation.client';
import { MessageClient } from '@core/client/message.client';
import { TaskClient } from '@core/client/task.client';
import { TeamClient } from '@core/client/team.client';
import { UserClient } from '@core/client/user.client';
import {
    CreateInvitationInput,
    CreateMessageInput,
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
import { TaskState } from '@core/storage/states/task.state';
import { TeamMemberState } from '@core/storage/states/teamMember.state';

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
    mergeTask,
    mergeTeam,
    mergeUser,
    replaceAndMergeTeamTasks,
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
    ) {
        const url = `${this.webSocketEndpoint}/real-time-state-sync/clients/connect`;
        this.connection = new WebSocketConnection(url, this.identityClient);
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

                const mutation = Mutation.fromMutationPayload(message);
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
        if (match.length == 0) {
            return false;
        }

        appState.currTeamId = currTeamId;
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

    public async pullCurrentTeamTasks(): Promise<void> {
        let appState = this.localStore.getState();
        const currTeamId = appState.currTeamId;
        if (!currTeamId) {
            return;
        }

        const tasksPreview = await this.taskClient.getTasksPreview(
            `${currTeamId}`,
        );
        appState = replaceAndMergeTeamTasks(appState, currTeamId, tasksPreview);
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

        const teamMembers = members.map(
            (user) => new TeamMemberState(teamId, toInt(user.id)!),
        );
        appState = replaceTeamMembers(appState, teamId, teamMembers);
        members.forEach((member) => {
            appState = mergeUser(appState, member);
        });

        this.localStore.updateState(appState);
    }

    public async pullTask(taskId: number): Promise<void> {
        const remoteTask = await this.taskClient.getTask(`${taskId}`);
        let appState = this.localStore.getState();
        appState = mergeTask(appState, remoteTask);
        this.localStore.updateState(appState);
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
    ): Promise<void> {
        const remoteTask = await this.taskClient.createTask(`${teamId}`, {
            goal: task.goal,
            context: task.context,
            ownerUserId: task.ownerUserId ? `${task.ownerUserId}` : undefined,
            dueAt: task.dueAt,
        });

        let appState = this.localStore.getState();
        appState = mergeTask(appState, remoteTask);
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
        await this.taskClient.deleteTask(`${taskId}`);
        let appState = this.localStore.getState();
        const deletedThreadId = appState.tasks[taskId].commentsThreadId;
        appState = deleteThread(appState, deletedThreadId);
        delete appState.tasks[taskId];
        this.localStore.updateState(appState);
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

    public async updateUser(
        userId: number,
        input: UpdateUserInput,
    ): Promise<void> {
        const remoteUser = await this.userClient.updateUser(`${userId}`, input);
        let appState = this.localStore.getState();
        appState = mergeUser(appState, remoteUser);
        this.localStore.updateState(appState);
    }

    public async createUser(user: CreateUserInput): Promise<void> {
        await this.userClient.createUser(user);
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
        await this.messageClient.deleteMessage(`${messageId}`);
        let appState = this.localStore.getState();
        delete appState.messages[messageId];
        this.localStore.updateState(appState);
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
        await this.invitationClient.deleteInvitation(`${invitationId}`);
        let appState = this.localStore.getState();
        delete appState.invitations[invitationId];
        this.localStore.updateState(appState);
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
