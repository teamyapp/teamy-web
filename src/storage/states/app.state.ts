import { InvitationState } from '@core/storage/states/invitation.state';
import { MessageState } from '@core/storage/states/message.state';
import { SprintState } from '@core/storage/states/sprint.state';
import { SprintTaskRelationState } from '@core/storage/states/sprintTaskRelation.state';
import { TaskState } from '@core/storage/states/task.state';
import { TaskAwaitForRelationState } from '@core/storage/states/taskAwaitForRelation.state';
import { TeamState } from '@core/storage/states/team.state';
import { TeamMemberState } from '@core/storage/states/teamMember.state';
import { UserState } from '@core/storage/states/user.state';
import { UserLinkState } from '@core/storage/states/userLink.state';

export class AppState {
    public constructor(
        public users: Record<number, UserState>,
        public teams: Record<number, TeamState>,
        public tasks: Record<number, TaskState>,
        public messages: Record<number, MessageState>,
        public invitations: Record<number, InvitationState>,
        public sprints: Record<number, SprintState>,
        public teamMembers: TeamMemberState[],
        public taskAwaitForRelations: TaskAwaitForRelationState[],
        public userLinks: UserLinkState[],
        public sprintTaskRelations: SprintTaskRelationState[],
        public teamSelectedSprint: Record<number, number>,
        public currUserId?: number,
        public currTeamId?: number,
        public currSprintId?: number,
    ) {}

    public static fromJson(json: any): AppState {
        const users = getUsers(json);
        const teams = getTeams(json);
        const tasks = getTasks(json);
        const messages = getMessages(json);
        const invitations = getInvitations(json);
        const sprints = getSprints(json);
        const teamMembers = getTeamMembers(json);
        const taskAwaitForRelations = getTaskAwaitForRelations(json);
        const userLinks = getUserLinks(json);
        const sprintTaskRelations = getSprintTaskRelations(json);
        return new AppState(
            users,
            teams,
            tasks,
            messages,
            invitations,
            sprints,
            teamMembers,
            taskAwaitForRelations,
            userLinks,
            sprintTaskRelations,
            json.teamSelectedSprint || {},
            json.currUserId,
            json.currTeamId,
            json.currSprintId,
        );
    }
}

function getUsers(json: any) {
    const users: Record<number, UserState> = {};
    const usersJson = (json.users as Record<number, any>) || {};
    for (let userId in usersJson) {
        users[userId] = UserState.fromJson(usersJson[userId]);
    }

    return users;
}

function getTeams(json: any) {
    const teams: Record<number, TeamState> = {};
    const teamsJson = (json.teams as Record<number, any>) || {};
    for (let teamId in teamsJson) {
        teams[teamId] = TeamState.fromJson(teamsJson[teamId]);
    }

    return teams;
}

function getTasks(json: any) {
    const tasks: Record<number, TaskState> = {};
    const tasksJson = (json.tasks as Record<number, any>) || {};
    for (let taskId in tasksJson) {
        tasks[taskId] = TaskState.fromJson(tasksJson[taskId]);
    }

    return tasks;
}

function getMessages(json: any) {
    const messages: Record<number, MessageState> = {};
    const messagesJson = (json.messages as Record<number, any>) || {};
    for (let messageId in messagesJson) {
        messages[messageId] = MessageState.fromJson(messagesJson[messageId]);
    }

    return messages;
}

function getInvitations(json: any) {
    const invitations: Record<number, InvitationState> = {};
    const invitationsJson = (json.invitations as Record<number, any>) || {};
    for (let invitationId in invitationsJson) {
        invitations[invitationId] = InvitationState.fromJson(
            invitationsJson[invitationId],
        );
    }

    return invitations;
}

function getSprints(json: any) {
    const sprints: Record<number, SprintState> = {};
    const sprintsJson = (json.sprints as Record<number, any>) || {};
    for (let sprintId in sprintsJson) {
        sprints[sprintId] = SprintState.fromJson(sprintsJson[sprintId]);
    }

    return sprints;
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

function getUserLinks(json: any) {
    const getUserLinksJson = (json.userLinks as any[]) || [];
    return getUserLinksJson.map(UserLinkState.fromJson);
}

function getSprintTaskRelations(json: any) {
    const sprintTaskRelationsJson = (json.sprintTaskRelations as any[]) || [];
    return sprintTaskRelationsJson.map(SprintTaskRelationState.fromJson);
}
