import {UserState} from '@core/statev2/user.state';
import {TeamState} from '@core/statev2/team.state';
import {TaskState} from '@core/statev2/task.state';
import {InvitationState} from '@core/statev2/invitation.state';
import {TeamMemberState} from '@core/statev2/teamMember.state';
import {
  TaskAwaitForRelationState
} from '@core/statev2/taskAwaitForRelation.state';

export class AppState {
  constructor(
    public users: {[userId: number]: UserState},
    public teams: {[teamId: number]: TeamState},
    public tasks: {[taskId: number]: TaskState},
    public invitations: {[invitationId: number]: InvitationState},
    public teamMembers: {[key: string]: TeamMemberState},
    public taskAwaitForRelations: {[key: string]: TaskAwaitForRelationState},
    public currUserId?: number,
    public currTeamId?: number,
  ) {}

  public static fromJson(json: any): AppState {
    const users = getUsers(json)
    const teams = getTeams(json);
    const tasks = getTasks(json);
    const invitations = getInvitations(json);
    const teamMembers = getTeamMembers(json);
    const taskAwaitForRelations = getTaskAwaitForRelations(json);
    return new AppState(
      users,
      teams,
      tasks,
      invitations,
      teamMembers,
      taskAwaitForRelations,
      json.currUserId,
      json.currTeamId,
    )
  }
}

function getUsers(json: any) {
  const users: { [userId: number]: UserState } = {};
  const usersJson = json.users as { [userId: number]: any } || {};
  for (let userId in usersJson) {
    users[userId] = UserState.fromJson(usersJson[userId]);
  }

  return users;
}

function getTeams(json: any) {
  const teams: { [teamId: number]: TeamState } = {};
  const teamsJson = json.teams as { [teamId: number]: any } || {};
  for (let teamId in teamsJson) {
    teams[teamId] = TeamState.fromJson(teamsJson[teamId]);
  }

  return teams;
}

function getTasks(json: any) {
  const tasks: { [taskId: number]: TaskState } = {};
  const taskJson = json.tasks as { [taskId: number]: any } || {};
  for (let taskId in taskJson) {
    tasks[taskId] = TaskState.fromJson(taskJson[taskId]);
  }

  return tasks;
}


function getInvitations(json: any) {
  const invitations: { [invitationId: number]: InvitationState } = {};
  const invitationJson = json.invitations as { [invitationId: number]: any } || {};
  for (let invitationId in invitationJson) {
    invitations[invitationId] = InvitationState.fromJson(invitationJson[invitationId]);
  }

  return invitations
}

function getTeamMembers(json: any) {
  const teamMembers: { [key: string]: TeamMemberState } = {};
  const teamMembersJson = json.teamMembers as { [key: string]: any } || {};
  for (let key in teamMembersJson) {
    teamMembers[key] = TeamMemberState.fromJson(teamMembersJson[key]);
  }

  return teamMembers;
}

function getTaskAwaitForRelations(json: any) {
  const taskAwaitForRelations: { [key: string]: TaskAwaitForRelationState } = {};
  const taskAwaitForRelationsJson = json.taskAwaitForRelations as { [key: string]: any } || {};
  for (let key in taskAwaitForRelationsJson) {
    taskAwaitForRelations[key] = TaskAwaitForRelationState.fromJson(taskAwaitForRelationsJson[key]);
  }

  return taskAwaitForRelations;
}