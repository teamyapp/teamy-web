import { InvitationState } from '@core/storage/states/invitation.state';
import { MessageState } from '@core/storage/states/message.state';
import { TaskState } from '@core/storage/states/task.state';
import { TaskAwaitForRelationState } from '@core/storage/states/taskAwaitForRelation.state';
import { TeamState } from '@core/storage/states/team.state';
import { TeamMemberState } from '@core/storage/states/teamMember.state';
import { UserState } from '@core/storage/states/user.state';

export class AppState {
    public constructor(
        public users: { [userId: number]: UserState },
        public teams: { [teamId: number]: TeamState },
        public tasks: { [taskId: number]: TaskState },
        public messages: { [messageId: number]: MessageState },
        public invitations: { [invitationId: number]: InvitationState },
        public teamMembers: TeamMemberState[],
        public taskAwaitForRelations: TaskAwaitForRelationState[],
        public currUserId?: number,
        public currTeamId?: number,
    ) {}

    public static fromJson(json: any): AppState {
        const users = getUsers(json);
        const teams = getTeams(json);
        const tasks = getTasks(json);
        const messages = getMessages(json);
        const teamMembers = getTeamMembers(json);
        const invitations = getInvitations(json);
        const taskAwaitForRelations = getTaskAwaitForRelations(json);
        return new AppState(
            users,
            teams,
            tasks,
            messages,
            invitations,
            teamMembers,
            taskAwaitForRelations,
            json.currUserId,
            json.currTeamId,
        );
    }
}

function getUsers(json: any) {
    const users: { [userId: number]: UserState } = {};
    const usersJson = (json.users as { [userId: number]: any }) || {};
    for (let userId in usersJson) {
        users[userId] = UserState.fromJson(usersJson[userId]);
    }

    return users;
}

function getTeams(json: any) {
    const teams: { [teamId: number]: TeamState } = {};
    const teamsJson = (json.teams as { [teamId: number]: any }) || {};
    for (let teamId in teamsJson) {
        teams[teamId] = TeamState.fromJson(teamsJson[teamId]);
    }

    return teams;
}

function getTasks(json: any) {
    const tasks: { [taskId: number]: TaskState } = {};
    const tasksJson = (json.tasks as { [taskId: number]: any }) || {};
    for (let taskId in tasksJson) {
        tasks[taskId] = TaskState.fromJson(tasksJson[taskId]);
    }

    return tasks;
}

function getMessages(json: any) {
    const messages: { [messageId: number]: MessageState } = {};
    const messagesJson = (json.messages as { [messageId: number]: any }) || {};
    for (let messageId in messagesJson) {
        messages[messageId] = MessageState.fromJson(messagesJson[messageId]);
    }

    return messages;
}

function getInvitations(json: any) {
    const invitations: { [invitationId: number]: InvitationState } = {};
    const invitationsJson =
        (json.invitations as { [invitationId: number]: any }) || {};
    for (let invitationId in invitationsJson) {
        invitations[invitationId] = InvitationState.fromJson(
            invitationsJson[invitationId],
        );
    }

    return invitations;
}

function getTeamMembers(json: any) {
    const teamMembersJson = (json.teamMembers as any[]) || [];
    return teamMembersJson.map(TeamMemberState.fromJson);
}

function getTaskAwaitForRelations(json: any) {
    const taskAwaitForRelationsJson =
        (json.taskAwaitForRelations as any[]) || [];
    return taskAwaitForRelationsJson.map(TaskAwaitForRelationState.fromJson);
}
