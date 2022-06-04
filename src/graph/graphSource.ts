import { PopChannel, chan, multi } from '@lib/csp/csp';

import { RemoteInvitation } from '@core/client/entity/remoteInvitation';
import { RemoteMessage } from '@core/client/entity/remoteMessage';
import { RemoteTask } from '@core/client/entity/remoteTask';
import { RemoteTeam } from '@core/client/entity/remoteTeam';
import { RemoteThread } from '@core/client/entity/remoteThread';
import { RemoteUser } from '@core/client/entity/remoteUser';
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
import { Invitation } from '@core/graph/invitation';
import { Task } from '@core/graph/task';
import { AppState } from '@core/state/app.state';
import { InvitationState } from '@core/state/invitation.state';
import { MessageState } from '@core/state/message.state';
import { TaskState } from '@core/state/task.state';
import { TaskAction } from '@core/state/taskAction';
import { TaskStatus } from '@core/state/taskStatus';
import { TeamState } from '@core/state/team.state';
import { ThreadState } from '@core/state/thread.state';
import { UserState } from '@core/state/user.state';

import { Team } from './team';
import { User } from './user';

const appStateKey = 'appState';

const availableActions: Map<TaskStatus, TaskAction[]> = new Map<
    TaskStatus,
    TaskAction[]
>();
availableActions.set('PAUSED', ['START', 'DELETE', 'ASSIGN_OWNER']);

export class GraphSource {
    private readonly appState: AppState;
    private readonly stateChangeChan = chan<boolean>();
    private readonly stateChangeMulti = multi<boolean>(this.stateChangeChan);

    constructor(
        private userClient: UserClient,
        private taskClient: TaskClient,
        private teamClient: TeamClient,
        private invitationClient: InvitationClient,
        private messageClient: MessageClient,
    ) {
        const savedState = localStorage.getItem(appStateKey);
        this.appState = savedState
            ? JSON.parse(savedState)
            : {
                  users: {},
                  teams: {},
                  tasks: {},
                  invitations: {},
                  threads: {},
                  messages: {},
              };
    }

    subscribeStateChange(): PopChannel<boolean | undefined> {
        const chan = this.stateChangeMulti.copy();
        chan.put(true);
        return chan;
    }

    close() {
        this.stateChangeChan.close();
    }

    currentUser(): User | undefined {
        if (!this.appState.currentUserId) {
            return undefined;
        }

        return new User(
            this.appState,
            this.appState.users[this.appState.currentUserId],
        );
    }

    async syncCurrentUser(): Promise<void> {
        const remoteUser = await this.userClient.getMe();
        if (!remoteUser) {
            return;
        }

        this.mergeUser(remoteUser);
        this.appState.currentUserId = id(remoteUser.id);
        this.onUpdateState();
    }

    async syncCurrentUserWithTeams(): Promise<void> {
        const remoteUser = await this.userClient.getMeWithTeams();
        if (!remoteUser) {
            return;
        }

        this.mergeUser(remoteUser);
        this.appState.currentUserId = id(remoteUser.id);
        this.onUpdateState();
    }

    currentTeam(): Team | undefined {
        if (!this.appState.currentTeamId) {
            return undefined;
        }

        return this.team(this.appState.currentTeamId);
    }

    team(teamId: number): Team | undefined {
        return new Team(this.appState, this.appState.teams[teamId]);
    }

    async syncCurrentTeam(): Promise<void> {
        const currentTeamId = this.currentTeam()?.id;
        if (!currentTeamId) {
            return;
        }
        return this.setCurrentTeam(currentTeamId);
    }

    async setCurrentTeam(currentTeamId: number): Promise<void> {
        if (this.appState.currentTeamId === currentTeamId) {
            return;
        }

        const tasksPreview = await this.taskClient.getTasksPreview(
            `${currentTeamId}`,
        );
        this.appState.teams[currentTeamId].taskIds = tasksPreview?.map(
            (task) => id(task.id)!,
        );
        tasksPreview?.forEach((taskPreview) => this.mergeTask(taskPreview));
        this.appState.currentTeamId = currentTeamId;
        this.onUpdateState();
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
        this.mergeTeam(remoteTeam);
        this.onUpdateState();
    }

    public async createTeam(team: CreateTeamInput): Promise<void> {
        const remoteTeam = await this.teamClient.createTeam(team);
        this.mergeTeam(remoteTeam);
        const userId = this.currentUser()!.id;
        const teamId = id(remoteTeam.id)!;
        const teamIds = this.appState.users[userId].teamIds || [];
        teamIds.push(teamId);
        this.appState.users[userId].teamIds = teamIds;
        this.onUpdateState();
    }

    public async syncCurrentTeamMembers(): Promise<void> {
        if (!this.appState.currentTeamId) {
            return;
        }

        await this.syncTeamMembers(this.appState.currentTeamId);
    }

    public async syncTeamMembers(teamId: number): Promise<void> {
        const members =
            (await this.teamClient.getTeamMembers(`${teamId}`)) || [];
        members?.forEach(this.mergeUser.bind(this));
        const oldMemberUserIds = this.appState.teams[teamId].memberUserIds;
        this.appState.teams[teamId].memberUserIds =
            members === undefined
                ? oldMemberUserIds
                : members?.map((member) => id(member.id)!);
        this.onUpdateState();
    }

    public async addTeamMember(teamId: number, userId: number): Promise<void> {
        const remoteMember = await this.teamClient.addMemberToTeam(
            `${teamId}`,
            `${userId}`,
        );
        this.mergeUser(remoteMember);
        const memberUserIds = this.appState.teams[teamId].memberUserIds || [];
        memberUserIds.push(userId);
        this.appState.teams[teamId].memberUserIds = memberUserIds;
        this.onUpdateState();
    }

    public task(taskId: number): Task {
        return new Task(this.appState, this.appState.tasks[taskId]);
    }

    public async syncTask(taskId: number) {
        const remoteTask = await this.taskClient.getTask(`${taskId}`);
        this.mergeTask(remoteTask);
        this.onUpdateState();
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
        this.mergeTask(remoteTask);
        this.appState.teams[teamId].taskIds?.push(id(remoteTask.id)!);
        this.onUpdateState();
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
        this.mergeTask(remoteTask);
        this.onUpdateState();
    }

    public async deleteTask(taskId: number) {
        await this.taskClient.deleteTask(`${taskId}`);
        const deletedTask = this.task(taskId);
        delete this.appState.tasks[taskId];
        const owningTeamId = deletedTask.owningTeam.id;
        const newTaskIds = this.appState.teams[owningTeamId].taskIds.filter(
            (newTaskId) => newTaskId !== taskId,
        );
        this.appState.teams[owningTeamId].taskIds = newTaskIds;
        this.onUpdateState();
    }

    public async moveTaskToInProgress(taskId: number) {
        const currUserId = this.currentUser()!.id;
        this.currentTeam()
            ?.tasks.filter((task) => task.status === 'IN_PROGRESS')
            .forEach((task) => {
                const taskState = this.appState.tasks[task.id];
                if (!taskState.ownerUserId) {
                    taskState.ownerUserId = currUserId;
                }

                taskState.status = 'PAUSED';
                taskState.availableActions =
                    availableActions.get('PAUSED')?.map((action) => action) ||
                    [];
                this.appState.tasks[task.id] = taskState;
            });
        const remoteTask = await this.taskClient.moveTaskToInProgress(
            `${taskId}`,
        );
        this.mergeTask(remoteTask);
        this.onUpdateState();
    }

    public async moveTaskToDelivered(taskId: number) {
        const remoteTask = await this.taskClient.moveTaskToDelivered(
            `${taskId}`,
        );
        this.mergeTask(remoteTask);
        this.onUpdateState();
    }

    public async updateUser(
        userId: number,
        input: UpdateUserInput,
    ): Promise<void> {
        const remoteUser = await this.userClient.updateUser(`${userId}`, input);
        this.mergeUser(remoteUser);
        this.onUpdateState();
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
        this.mergeMessage(message);
        const messageIds = this.appState.threads[threadId].messageIds || [];
        messageIds.push(id(message.id)!);
        this.appState.threads[threadId].messageIds = messageIds;
        this.onUpdateState();
    }

    public async deleteMessage(messageId: number): Promise<void> {
        await this.messageClient.deleteMessage(`${messageId}`);
        const deletedMessage = this.appState.messages[messageId];
        const threadId = deletedMessage.threadId;
        const newMessageIds = this.appState.threads[threadId].messageIds.filter(
            (newMessageId) => newMessageId !== messageId,
        );
        this.appState.threads[threadId].messageIds = newMessageIds;
        delete this.appState.messages[messageId];
        this.onUpdateState();
    }

    public async updateMessage(
        messageId: number,
        input: UpdateMessageInput,
    ): Promise<void> {
        const message = await this.messageClient.updateMessage(
            `${messageId}`,
            input,
        );
        this.mergeMessage(message);
        this.onUpdateState();
    }

    invitation(id: number): Invitation | undefined {
        const invitation = this.appState.invitations[id];
        if (invitation) {
            return new Invitation(this.appState, invitation);
        }
    }

    public async syncInvitation(invitationId: number, invitationCode: string) {
        const invitation = await this.invitationClient.getInvitation(
            `${invitationId}`,
            invitationCode,
        );
        if (invitation) {
            this.mergeInvitation(invitation);
        }

        this.onUpdateState();
    }

    public async syncInvitations(teamId: number) {
        const invitations = await this.invitationClient.getInvitations(
            `${teamId}`,
        );
        invitations?.forEach(this.mergeInvitation.bind(this));
        const oldInvitations = this.appState.teams[teamId].invitationIds;
        this.appState.teams[teamId].invitationIds =
            invitations === undefined
                ? oldInvitations
                : invitations.map((invitation) => id(invitation.id)!);
        this.onUpdateState();
    }

    public async createInvitation(
        teamId: number,
        input: CreateInvitationInput,
    ): Promise<[invitationId: number, invitationCode: string]> {
        const invitation = await this.invitationClient.createInvitation(
            `${teamId}`,
            input,
        );
        this.mergeInvitation(invitation);
        const invitationId = id(invitation.id)!;
        this.appState.teams[teamId].invitationIds.push(invitationId);
        this.onUpdateState();
        return [invitationId, invitation.code!];
    }

    public async acceptInvitation(
        invitationId: number,
        invitationCode: string,
    ): Promise<void> {
        const invitation = await this.invitationClient.acceptInvitation(
            `${invitationId}`,
            invitationCode,
        );
        this.mergeInvitation(invitation);
        this.onUpdateState();
    }

    public async declineInvitation(
        invitationId: number,
        invitationCode: string,
    ) {
        const invitation = await this.invitationClient.declineInvitation(
            `${invitationId}`,
            invitationCode,
        );
        this.mergeInvitation(invitation);
        this.onUpdateState();
    }

    public async deleteInvitation(invitationId: number): Promise<void> {
        await this.invitationClient.deleteInvitation(`${invitationId}`);
        const deletedInvitation = this.appState.invitations[invitationId];
        const teamId = deletedInvitation.joiningTeamId;
        const newInvitationIds = this.appState.teams[
            teamId
        ]?.invitationIds.filter(
            (newInvitationId) => newInvitationId !== invitationId,
        );
        this.appState.teams[teamId].invitationIds = newInvitationIds;
        delete this.appState.invitations[invitationId];
        this.onUpdateState();
    }

    private onUpdateState() {
        localStorage.setItem(appStateKey, JSON.stringify(this.appState));
        this.stateChangeChan.put(true);
    }

    private mergeUser(remoteUser: RemoteUser) {
        const remoteUserId = id(remoteUser.id)!;
        const localOldUser = this.appState.users[remoteUserId] || {
            teamIds: [],
        };
        const localNewUser: UserState = {
            id: remoteUserId,
            firstName: remoteUser.firstName || localOldUser.firstName,
            lastName: remoteUser.lastName || localOldUser.lastName,
            profileUrl:
                remoteUser.profileUrl === undefined
                    ? localOldUser.profileUrl
                    : remoteUser.profileUrl,
            createdAt: remoteUser.createdAt || localOldUser.createdAt,
            teamIds:
                remoteUser.teams?.map((team) => id(team.id)!) ||
                localOldUser.teamIds,
        };

        remoteUser.teams?.forEach(this.mergeTeam.bind(this));
        this.appState.users[remoteUserId] = localNewUser;
    }

    private mergeTeam(remoteTeam: RemoteTeam) {
        const remoteTeamId = id(remoteTeam.id)!;
        const localOldTeam = this.appState.teams[remoteTeamId] || {
            taskIds: [],
            memberUserIds: [],
            invitationIds: [],
        };
        const localNewTeam: TeamState = {
            id: remoteTeamId,
            name: remoteTeam.name || localOldTeam.name,
            iconUrl:
                remoteTeam.iconUrl === undefined
                    ? localOldTeam.iconUrl
                    : remoteTeam.iconUrl,
            createdAt: remoteTeam.createdAt
                ? new Date(remoteTeam.createdAt)
                : localOldTeam.createdAt,
            creatorUserId:
                id(remoteTeam.creator?.id) || localOldTeam.creatorUserId,
            ownerUserId: id(remoteTeam.owner?.id) || localOldTeam.ownerUserId,
            memberUserIds:
                remoteTeam.members?.map((user) => id(user.id)!) ||
                localOldTeam.memberUserIds,
            taskIds:
                remoteTeam.tasks?.map((task) => id(task.id)!) ||
                localOldTeam.taskIds,
            invitationIds:
                remoteTeam.invitations?.map(
                    (invitation) => id(invitation.id)!,
                ) || localOldTeam.invitationIds,
        };

        if (remoteTeam.creator) {
            this.mergeUser(remoteTeam.creator);
        }

        remoteTeam.members?.forEach(this.mergeUser.bind(this));
        remoteTeam.tasks?.forEach(this.mergeTask.bind(this));
        remoteTeam.invitations?.forEach(this.mergeInvitation.bind(this));
        this.appState.teams[remoteTeamId] = localNewTeam;
    }

    private mergeTask(remoteTask: RemoteTask) {
        const remoteTaskId = id(remoteTask.id)!;
        const localOldTask = this.appState.tasks[remoteTaskId] || {
            availableActions: [],
        };
        const localNewTask: TaskState = {
            id: remoteTaskId,
            goal: remoteTask.goal || localOldTask.goal,
            context:
                remoteTask.context === undefined
                    ? localOldTask.goal
                    : remoteTask.context,
            creatorUserId:
                id(remoteTask.creator?.id) || localOldTask.creatorUserId,
            ownerUserId:
                remoteTask.owner === undefined
                    ? localOldTask.ownerUserId
                    : id(remoteTask.owner?.id),
            owningTeamId:
                id(remoteTask.owningTeam?.id) || localOldTask.owningTeamId,
            status: remoteTask.status || localOldTask.status,
            commentsThreadId:
                id(remoteTask.comments?.id) || localOldTask.commentsThreadId,
            createdAt: remoteTask.createdAt || localOldTask.createdAt,
            updatedAt:
                remoteTask.updatedAt === undefined
                    ? localOldTask.updatedAt
                    : remoteTask.updatedAt,
            dueAt:
                remoteTask.dueAt === undefined
                    ? localOldTask.dueAt
                    : remoteTask.dueAt,
            effort:
                remoteTask.effort === undefined
                    ? localOldTask.effort
                    : remoteTask.effort,
            availableActions:
                remoteTask.availableActions || localOldTask.availableActions,
        };

        if (remoteTask.creator) {
            this.mergeUser(remoteTask.creator);
        }

        if (remoteTask.owner) {
            this.mergeUser(remoteTask.owner);
        }

        if (remoteTask.owningTeam) {
            this.mergeTeam(remoteTask.owningTeam);
        }

        if (remoteTask.comments) {
            this.mergeThread(remoteTask.comments);
        }

        this.appState.tasks[remoteTaskId] = localNewTask;
    }

    private mergeInvitation(remoteInvitation: RemoteInvitation) {
        const remoteInvitationId = id(remoteInvitation.id)!;
        const localOldInvitation =
            this.appState.invitations[remoteInvitationId] || {};
        const localNewInvitation: InvitationState = {
            id: remoteInvitationId,
            senderUserId:
                id(remoteInvitation.sender?.id) ||
                localOldInvitation.senderUserId,
            receiverFirstName:
                remoteInvitation.receiverFirstName === undefined
                    ? localOldInvitation.receiverFirstName
                    : remoteInvitation.receiverFirstName,
            receiverLastName:
                remoteInvitation.receiverLastName === undefined
                    ? localOldInvitation.receiverLastName
                    : remoteInvitation.receiverLastName,
            receiverEmail:
                remoteInvitation.receiverEmail === undefined
                    ? localOldInvitation.receiverEmail
                    : remoteInvitation.receiverEmail,
            receiverUserId:
                remoteInvitation.receiver === undefined
                    ? localOldInvitation.receiverUserId
                    : id(remoteInvitation.receiver?.id),
            joiningTeamId:
                id(remoteInvitation.joiningTeam?.id) ||
                localOldInvitation.joiningTeamId,
            expireAt: remoteInvitation.expireAt
                ? new Date(remoteInvitation.expireAt)
                : localOldInvitation.expireAt,
            createdAt: remoteInvitation.createdAt
                ? new Date(remoteInvitation.createdAt)
                : localOldInvitation.createdAt,
            updatedAt:
                remoteInvitation.updatedAt === undefined
                    ? localOldInvitation.updatedAt
                    : new Date(remoteInvitation.updatedAt),
            status: remoteInvitation.status || localOldInvitation.status,
            code: remoteInvitation.code || localOldInvitation.code,
        };

        if (remoteInvitation.sender) {
            this.mergeUser(remoteInvitation.sender);
        }

        if (remoteInvitation.receiver) {
            this.mergeUser(remoteInvitation.receiver);
        }

        if (remoteInvitation.joiningTeam) {
            this.mergeTeam(remoteInvitation.joiningTeam);
        }

        this.appState.invitations[remoteInvitationId] = localNewInvitation;
    }

    private mergeThread(remoteThread: RemoteThread) {
        const remoteThreadId = id(remoteThread.id)!;
        const localOldThread = this.appState.threads[remoteThreadId] || {
            messageIds: [],
        };
        const localNewThread: ThreadState = {
            id: remoteThreadId,
            messageIds:
                remoteThread.messages?.map((message) => id(message.id)!) ||
                localOldThread.messageIds,
        };

        remoteThread.messages?.forEach(this.mergeMessage.bind(this));
        this.appState.threads[remoteThreadId] = localNewThread;
    }

    private mergeMessage(remoteMessage: RemoteMessage) {
        const remoteMessageId = id(remoteMessage.id)!;
        const localOldMessage = this.appState.messages[remoteMessageId] || {};
        const localNewMessage: MessageState = {
            id: remoteMessageId,
            body: remoteMessage.body || localOldMessage.body,
            authorUserId:
                id(remoteMessage.author?.id) || localOldMessage.authorUserId,
            threadId: id(remoteMessage.thread?.id) || localOldMessage.threadId,
            createdAt: remoteMessage.createdAt
                ? new Date(remoteMessage.createdAt)
                : localOldMessage.createdAt,
            updatedAt:
                remoteMessage.updatedAt === undefined
                    ? localOldMessage.updatedAt
                    : new Date(remoteMessage.updatedAt),
        };

        if (remoteMessage.author) {
            this.mergeUser(remoteMessage.author);
        }

        if (remoteMessage.thread) {
            this.mergeThread(remoteMessage.thread);
        }

        this.appState.messages[remoteMessageId] = localNewMessage;
    }
}

function id(idStr: string | undefined): number | undefined {
    if (idStr) {
        return parseInt(idStr);
    }
}
