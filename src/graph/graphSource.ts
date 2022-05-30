import { PopChannel, chan, multi } from '@lib/csp/csp';

import { RemoteInvitation } from '@core/client/entity/remoteInvitation';
import { RemoteMessage } from '@core/client/entity/remoteMessage';
import { RemoteTask } from '@core/client/entity/remoteTask';
import { RemoteTeam } from '@core/client/entity/remoteTeam';
import { RemoteThread } from '@core/client/entity/remoteThread';
import { RemoteUser } from '@core/client/entity/remoteUser';
import { TaskClient } from '@core/client/task.client';
import { UserClient } from '@core/client/user.client';
import { AppState } from '@core/statev2/app.state';
import { InvitationState } from '@core/statev2/invitation.state';
import { MessageState } from '@core/statev2/message.state';
import { TaskState } from '@core/statev2/task.state';
import { TeamState } from '@core/statev2/team.state';
import { ThreadState } from '@core/statev2/thread.state';
import { UserState } from '@core/statev2/user.state';

import { Team } from './team';
import { User } from './user';

const appStateKey = 'appState';

export class GraphSource {
    private readonly appState: AppState;
    private readonly stateChangeChan = chan<boolean>();
    private readonly stateChangeMulti = multi<boolean>(this.stateChangeChan);

    constructor(
        private userClient: UserClient,
        private taskClient: TaskClient,
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
        return this.stateChangeMulti.copy();
    }

    close() {
        this.stateChangeChan.close();
    }

    get currentUser(): User | undefined {
        if (!this.appState.currentUserId) {
            return undefined;
        }

        return new User(
            this.appState,
            this.appState.users[this.appState.currentUserId],
        );
    }

    get currentTeam(): Team | undefined {
        if (!this.appState.currentTeamId) {
            return undefined;
        }

        return new Team(
            this.appState,
            this.appState.teams[this.appState.currentTeamId],
        );
    }

    async setMe(currentUserId: number): Promise<void> {
        if (this.appState.currentUserId === currentUserId) {
            return;
        }

        const remoteUser = await this.userClient.getMe();
        this.mergeUser(remoteUser);
        this.appState.currentUserId = currentUserId;
        await this.stateChangeChan.put(true);
    }

    async setCurrentTeam(currentTeamId: number): Promise<void> {
        if (this.appState.currentTeamId === currentTeamId) {
            return;
        }

        const tasksPreview = await this.taskClient.getTasksPreview(
            currentTeamId,
        );
        tasksPreview.forEach((taskPreview) => this.mergeTask(taskPreview));
        this.appState.currentTeamId = currentTeamId;
        await this.stateChangeChan.put(true);
    }

    private async onUpdateState(): Promise<void> {
        localStorage.setItem(appStateKey, JSON.stringify(this.appState));
        await this.stateChangeChan.put(true);
    }

    private mergeUser(remoteUser: RemoteUser) {
        const localOldUser = this.appState.users[remoteUser.id] || {};
        const localNewUser: UserState = {
            id: remoteUser.id,
            firstName: remoteUser.firstName || localOldUser.firstName,
            lastName: remoteUser.lastName || localOldUser.lastName,
            profileUrl:
                remoteUser.profileUrl === undefined
                    ? localOldUser.profileUrl
                    : remoteUser.profileUrl,
            createdAt: remoteUser.createdAt || localOldUser.createdAt,
            teamIds:
                remoteUser.teams?.map((team) => team.id) ||
                localOldUser.teamIds,
        };

        remoteUser.teams?.forEach(this.mergeTeam);
        this.appState.users[remoteUser.id] = localNewUser;
    }

    private mergeTeam(remoteTeam: RemoteTeam) {
        const localOldTeam = this.appState.teams[remoteTeam.id] || {};
        const localNewTeam: TeamState = {
            id: remoteTeam.id,
            name: remoteTeam.name || localOldTeam.name,
            iconUrl:
                remoteTeam.iconUrl === undefined
                    ? localOldTeam.iconUrl
                    : remoteTeam.iconUrl,
            createdAt: remoteTeam.createdAt || localOldTeam.createdAt,
            creatorUserId: remoteTeam.creator?.id || localOldTeam.creatorUserId,
            memberUserIds:
                remoteTeam.members?.map((user) => user.id) ||
                localOldTeam.memberUserIds,
            taskIds:
                remoteTeam.tasks?.map((task) => task.id) ||
                localOldTeam.taskIds,
            invitationIds:
                remoteTeam.invitations?.map((invitation) => invitation.id) ||
                localOldTeam.invitationIds,
        };

        if (remoteTeam.creator) {
            this.mergeUser(remoteTeam.creator);
        }

        remoteTeam.members?.forEach(this.mergeUser);
        remoteTeam.tasks?.forEach(this.mergeTask);
        remoteTeam.invitations?.forEach(this.mergeInvitation);
        this.appState.teams[remoteTeam.id] = localNewTeam;
    }

    private mergeTask(remoteTask: RemoteTask) {
        const localOldTask = this.appState.tasks[remoteTask.id] || {};
        const localNewTask: TaskState = {
            id: remoteTask.id,
            goal: remoteTask.goal || localOldTask.goal,
            context:
                remoteTask.context === undefined
                    ? localOldTask.goal
                    : remoteTask.context,
            creatorUserId: remoteTask.creator?.id || localOldTask.creatorUserId,
            ownerUserId:
                remoteTask.owner === undefined
                    ? localOldTask.ownerUserId
                    : remoteTask.owner?.id,
            owningTeamId:
                remoteTask.owningTeam?.id || localOldTask.owningTeamId,
            status: remoteTask.status || localOldTask.status,
            commentsThreadId:
                remoteTask.comments?.id || localOldTask.commentsThreadId,
            createdAt: remoteTask.createdAt || localOldTask.createdAt,
            updatedAt:
                remoteTask.updatedAt === undefined
                    ? localOldTask.updatedAt
                    : remoteTask.updatedAt,
            dueAt:
                remoteTask.dueAt === undefined
                    ? localOldTask.dueAt
                    : remoteTask.dueAt,
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

        this.appState.tasks[remoteTask.id] = localNewTask;
    }

    private mergeInvitation(remoteInvitation: RemoteInvitation) {
        const localOldInvitation =
            this.appState.invitations[remoteInvitation.id] || {};
        const localNewInvitation: InvitationState = {
            id: remoteInvitation.id,
            senderUserId:
                remoteInvitation.sender?.id || localOldInvitation.senderUserId,
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
                    : remoteInvitation.receiver?.id,
            joiningTeamId:
                remoteInvitation.joiningTeam?.id ||
                localOldInvitation.joiningTeamId,
            expireAt: remoteInvitation.expireAt || localOldInvitation.expireAt,
            createdAt:
                remoteInvitation.createdAt || localOldInvitation.createdAt,
            updatedAt:
                remoteInvitation.updatedAt === undefined
                    ? localOldInvitation.updatedAt
                    : remoteInvitation.updatedAt,
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

        this.appState.invitations[remoteInvitation.id] = localNewInvitation;
    }

    private mergeThread(remoteThread: RemoteThread) {
        const localOldThread = this.appState.threads[remoteThread.id] || {};
        const localNewThread: ThreadState = {
            id: remoteThread.id,
            messageIds:
                remoteThread.messages?.map((message) => message.id) ||
                localOldThread.messageIds,
        };

        remoteThread.messages?.forEach(this.mergeMessage);
        this.appState.threads[remoteThread.id] = localNewThread;
    }

    private mergeMessage(remoteMessage: RemoteMessage) {
        const localOldMessage = this.appState.messages[remoteMessage.id] || {};
        const localNewMessage: MessageState = {
            id: remoteMessage.id,
            body: remoteMessage.body || localOldMessage.body,
            authorUserId:
                remoteMessage.author?.id || localOldMessage.authorUserId,
            threadId: remoteMessage.thread?.id || localOldMessage.threadId,
            createdAt: remoteMessage.createdAt || localOldMessage.createdAt,
            updatedAt:
                remoteMessage.updatedAt === undefined
                    ? localOldMessage.updatedAt
                    : remoteMessage.updatedAt,
        };

        if (remoteMessage.author) {
            this.mergeUser(remoteMessage.author);
        }

        if (remoteMessage.thread) {
            this.mergeThread(remoteMessage.thread);
        }

        this.appState.messages[remoteMessage.id] = localNewMessage;
    }
}
