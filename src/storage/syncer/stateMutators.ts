import { RemoteClient } from '@core/client/entity/remoteClient';
import { RemoteInvitation } from '@core/client/entity/remoteInvitation';
import { RemoteMessage } from '@core/client/entity/remoteMessage';
import { RemoteSprint } from '@core/client/entity/remoteSprint';
import { RemoteSprintParticipant } from '@core/client/entity/remoteSprintParticipant';
import { RemoteTask } from '@core/client/entity/remoteTask';
import { RemoteTeam } from '@core/client/entity/remoteTeam';
import { RemoteTeamMember } from '@core/client/entity/remoteTeamMember';
import { RemoteThread } from '@core/client/entity/remoteThread';
import { RemoteUser } from '@core/client/entity/remoteUser';
import { TeamClient } from '@core/client/team.client';
import { Duration } from '@core/entity/duration';
import { AppState } from '@core/storage/states/app.state';
import { InvitationState } from '@core/storage/states/invitation.state';
import { MessageState } from '@core/storage/states/message.state';
import { toDate, toInt } from '@core/storage/states/parser';
import { SprintState } from '@core/storage/states/sprint.state';
import { SprintParticipantState } from '@core/storage/states/sprintParticipant.state';
import { SprintTaskRelationState } from '@core/storage/states/sprintTaskRelation.state';
import { TaskState } from '@core/storage/states/task.state';
import { TaskAwaitForRelationState } from '@core/storage/states/taskAwaitForRelation.state';
import { TeamState } from '@core/storage/states/team.state';
import { TeamMemberState } from '@core/storage/states/teamMember.state';
import { UserState } from '@core/storage/states/user.state';

import { ClientState } from '../states/client.state';
import { TaskActivityState } from '../states/taskActivity.state';
import { Mutation } from './mutation';

class DeleteTaskAwaitForRelationPayload {
    constructor(public awaitingTaskId: number, public awaitForTaskId: number) {}

    public static fromMutationPayload(
        json: any,
    ): DeleteTaskAwaitForRelationPayload {
        return new DeleteTaskAwaitForRelationPayload(
            json.AwaitingTaskID,
            json.AwaitForTaskID,
        );
    }
}

export function applyTaskMutation(
    currState: AppState,
    mutation: Mutation,
): AppState {
    switch (mutation.mutationType) {
        case 'Create':
        case 'Update': {
            const task = TaskState.fromMutationPayload(mutation.payload);
            currState.tasks[task.id] = task;
            break;
        }
        case 'Delete': {
            const taskId = mutation.payload;
            delete currState.tasks[taskId];
            break;
        }
    }

    return currState;
}

export function applySprintTaskMutation(
    currState: AppState,
    mutation: Mutation,
): AppState {
    switch (mutation.mutationType) {
        case 'Create': {
            const sprintTaskRelation =
                SprintTaskRelationState.fromMutationPayload(mutation.payload);

            if (
                currState.sprintTaskRelations.find(
                    (sprintTaskRelationItem) =>
                        sprintTaskRelationItem.taskId ===
                            sprintTaskRelation.taskId &&
                        sprintTaskRelationItem.sprintId ===
                            sprintTaskRelation.sprintId,
                )
            ) {
                break;
            }

            currState.sprintTaskRelations.push(sprintTaskRelation);
            break;
        }
        case 'Delete': {
            const sprintTaskRelation =
                SprintTaskRelationState.fromMutationPayload(mutation.payload);
            currState.sprintTaskRelations =
                currState.sprintTaskRelations.filter(
                    (sprintTaskRelationItem) =>
                        !(
                            sprintTaskRelationItem.taskId ===
                                sprintTaskRelation.taskId &&
                            sprintTaskRelationItem.sprintId ===
                                sprintTaskRelation.sprintId
                        ),
                );
        }
    }

    return currState;
}

export function applyInvitationMutation(
    currState: AppState,
    mutation: Mutation,
): AppState {
    switch (mutation.mutationType) {
        case 'Create':
        case 'Update': {
            const invitation = InvitationState.fromMutationPayload(
                mutation.payload,
            );
            currState.invitations[invitation.id] = invitation;
            break;
        }
        case 'Delete': {
            const invitationId = mutation.payload;
            delete currState.invitations[invitationId];
            break;
        }
    }

    return currState;
}

export function applyMessageMutation(
    currState: AppState,
    mutation: Mutation,
): AppState {
    switch (mutation.mutationType) {
        case 'Create':
        case 'Update': {
            const message = MessageState.fromMutationPayload(mutation.payload);
            currState.messages[message.id] = message;
            break;
        }
        case 'Delete': {
            const messageId = mutation.payload;
            delete currState.messages[messageId];
            break;
        }
    }

    return currState;
}

export function applyTeamMutation(
    currState: AppState,
    mutation: Mutation,
): AppState {
    switch (mutation.mutationType) {
        case 'Update': {
            const team = TeamState.fromMutationPayload(mutation.payload);
            currState.teams[team.id] = team;
            break;
        }
        case 'Delete': {
            const teamId = mutation.payload;
            currState.teamMembers = currState.teamMembers.filter(
                (teamMember) => teamMember.teamId !== teamId,
            );
            currState = deleteTeamTasks(currState, teamId);
            currState = deleteInvitations(currState, teamId);
            delete currState.teams[teamId];
            break;
        }
    }

    return currState;
}

export function applyUserMutation(
    currState: AppState,
    mutation: Mutation,
): AppState {
    switch (mutation.mutationType) {
        case 'Update': {
            const user = UserState.fromMutationPayload(mutation.payload);
            currState.users[user.id] = user;
            break;
        }
        case 'Delete': {
            const userId = mutation.payload;
            currState.teamMembers = currState.teamMembers.filter(
                (teamMember) => teamMember.userId !== userId,
            );
            delete currState.users[userId];
            break;
        }
    }

    return currState;
}

export async function applyTeamMemberMutation(
    currState: AppState,
    mutation: Mutation,
    teamClient: TeamClient,
): Promise<AppState> {
    switch (mutation.mutationType) {
        case 'Create': {
            const teamMember = TeamMemberState.fromMutationPayload(
                mutation.payload,
            )!;
            currState.teamMembers = currState.teamMembers.concat(teamMember);
            const remoteTeamMembers = await teamClient.getTeamMembers(
                `${teamMember.teamId}`,
            );
            for (const remoteTeamMember of remoteTeamMembers) {
                currState = mergeUser(currState, remoteTeamMember.user);
            }

            break;
        }
        case 'Delete': {
            const deletedTeamMember = TeamMemberState.fromMutationPayload(
                mutation.payload,
            )!;
            currState.teamMembers = currState.teamMembers.filter(
                (teamMember) =>
                    !(
                        teamMember.teamId === deletedTeamMember.teamId &&
                        teamMember.userId === deletedTeamMember.userId
                    ),
            );
            if (deletedTeamMember.userId === currState.currUserId) {
                currState.currUserId = undefined;
            }

            break;
        }
    }

    return currState;
}

export function applyTaskActivityMutation(
    currState: AppState,
    mutation: Mutation,
): AppState {
    switch (mutation.mutationType) {
        case 'Update': {
            const updatedTaskActivity = TaskActivityState.fromMutationPayload(mutation.payload)
            if (mutation.payload.DragTaskActivity.Client) {
                // TODO: merge client from realtime mutation payload 
                const clientState = ClientState.fromMutationPayload(mutation.payload.DragTaskActivity.Client)

                const localOldClient = currState.clients[clientState.id] || {}
                const localNewClient: ClientState = {
                    id: clientState.id,
                    userId: clientState.userId || localOldClient.userId
                }

                currState.clients[clientState.id] = localNewClient
            }
            
            const index = currState.taskActivities.findIndex(({taskId}) => {
                return taskId === updatedTaskActivity.taskId
            })

            if (index !== -1) {
                const localOldTaskActivity = currState.taskActivities[index]
                const localNewTaskActivity: TaskActivityState = {
                    taskId: updatedTaskActivity.taskId,
                    teamId: updatedTaskActivity.teamId,
                    dragTaskActivity: {
                        isDragging: updatedTaskActivity.dragTaskActivity.isDragging ?? localOldTaskActivity.dragTaskActivity.isDragging,
                        clientId: updatedTaskActivity.dragTaskActivity.clientId || localOldTaskActivity.dragTaskActivity.clientId
                    }
                }

                currState.taskActivities[index] = localNewTaskActivity
            } else {
                currState.taskActivities.push(updatedTaskActivity)
            }

            
            break;
        }
    }

    return currState;
}

export function applyTaskAwaitingForRelationMutation(
    currState: AppState,
    mutation: Mutation,
): AppState {
    switch (mutation.mutationType) {
        case 'Create': {
            const relation = TaskAwaitForRelationState.fromMutationPayload(
                mutation.payload,
            );
            currState.taskAwaitForRelations =
                currState.taskAwaitForRelations.concat(relation);
            break;
        }
        case 'Delete': {
            const deleteInput =
                DeleteTaskAwaitForRelationPayload.fromMutationPayload(
                    mutation.payload,
                );
            currState.taskAwaitForRelations =
                currState.taskAwaitForRelations.filter(
                    (relation) =>
                        relation.awaitingTaskId !==
                            deleteInput.awaitingTaskId &&
                        relation.awaitForTaskId !== deleteInput.awaitForTaskId,
                );
        }
    }

    return currState;
}

export function deleteInvitations(
    currState: AppState,
    teamId: number,
): AppState {
    const newInvitations: Record<number, InvitationState> = {};
    for (let invitationId in currState.invitations) {
        const invitation = currState.invitations[invitationId];
        if (invitation.teamId !== teamId) {
            newInvitations[invitationId] = invitation;
        }
    }

    currState.invitations = newInvitations;
    return currState;
}

export function deleteTeamTasks(currState: AppState, teamId: number): AppState {
    const newTasks: Record<number, TaskState> = {};
    for (let taskId in currState.tasks) {
        const task = currState.tasks[taskId];
        if (task.owningTeamId === teamId) {
            currState = deleteThread(currState, task.commentsThreadId);
        } else {
            newTasks[taskId] = task;
        }
    }

    currState.tasks = newTasks;
    return currState;
}

export function mergeClient(currAppState: AppState, remoteClient: RemoteClient): AppState {
    const clientId = Number(remoteClient.id)
    const localOldClient: ClientState = currAppState.clients[clientId] || {}
    const localNewClient: ClientState = {
        id: clientId,
        userId: toInt(remoteClient.user.id) || localOldClient.userId
    }

    currAppState.clients[clientId] = localNewClient
    return currAppState
}

export function mergeUser(
    currAppState: AppState,
    remoteUser: RemoteUser,
): AppState {
    const remoteUserId = toInt(remoteUser.id)!;
    const localOldUser: UserState = currAppState.users[remoteUserId] || {};
    const localNewUser: UserState = {
        id: remoteUserId,
        firstName: remoteUser.firstName || localOldUser.firstName,
        lastName: remoteUser.lastName || localOldUser.lastName,
        profileUrl:
            remoteUser.profileUrl === undefined
                ? localOldUser.profileUrl
                : remoteUser.profileUrl,
        createdAt: toDate(remoteUser.createdAt) || localOldUser.createdAt,
        updatedAt:
            remoteUser.updatedAt === undefined
                ? localOldUser.updatedAt
                : toDate(remoteUser.updatedAt),
    };

    remoteUser.teams?.forEach((remoteTeam) => {
        currAppState = mergeTeam(currAppState, remoteTeam);
    });

    currAppState.users[remoteUserId] = localNewUser;
    return currAppState;
}

export function mergeTask(
    currAppState: AppState,
    remoteTask: RemoteTask,
): AppState {
    const remoteTaskId = toInt(remoteTask.id)!;
    const localOldTask = currAppState.tasks[remoteTaskId] || {};
    const localNewTask: TaskState = {
        id: remoteTaskId,
        goal: remoteTask.goal || localOldTask.goal,
        context:
            remoteTask.context === undefined
                ? localOldTask.context
                : remoteTask.context,
        creatorUserId:
            toInt(remoteTask.creator?.id) || localOldTask.creatorUserId,
        ownerUserId:
            remoteTask.owner === undefined
                ? localOldTask.ownerUserId
                : toInt(remoteTask.owner?.id),
        owningTeamId:
            toInt(remoteTask.owningTeam?.id) || localOldTask.owningTeamId,
        status: remoteTask.status || localOldTask?.status,
        isPlanned:
            remoteTask.isPlanned === undefined
                ? localOldTask?.isPlanned
                : remoteTask.isPlanned,
        commentsThreadId:
            toInt(remoteTask.comments?.id) || localOldTask.commentsThreadId,
        createdAt: toDate(remoteTask.createdAt) || localOldTask.createdAt,
        updatedAt:
            remoteTask.updatedAt === undefined
                ? localOldTask.updatedAt
                : toDate(remoteTask.updatedAt),
        deliveredAt:
            remoteTask.deliveredAt === undefined
                ? localOldTask.deliveredAt
                : toDate(remoteTask.deliveredAt),
        dueAt:
            remoteTask.dueAt === undefined
                ? localOldTask.dueAt
                : toDate(remoteTask.dueAt),
        effort:
            remoteTask.effort === undefined
                ? localOldTask.effort
                : toDuration(remoteTask.effort),
    };

    if (remoteTask.creator) {
        currAppState = mergeUser(currAppState, remoteTask.creator);
    }

    if (remoteTask.owner) {
        currAppState = mergeUser(currAppState, remoteTask.owner);
    }

    if (remoteTask.owningTeam) {
        currAppState = mergeTeam(currAppState, remoteTask.owningTeam);
    }

    if (remoteTask.comments) {
        currAppState = mergeThread(currAppState, remoteTask.comments);
    }

    if (remoteTask.awaitForTasks) {
        currAppState = replaceAndMergeAwaitFor(
            currAppState,
            remoteTaskId,
            remoteTask.awaitForTasks,
        );
    }

    currAppState.tasks[remoteTaskId] = localNewTask;
    return currAppState;
}

export function mergeMessage(
    currAppState: AppState,
    remoteMessage: RemoteMessage,
): AppState {
    const remoteMessageId = toInt(remoteMessage.id)!;
    const localOldMessage = currAppState.messages[remoteMessageId] || {};
    const localNewMessage: MessageState = {
        id: remoteMessageId,
        body: remoteMessage.body || localOldMessage.body,
        authorUserId:
            toInt(remoteMessage.author?.id) || localOldMessage.authorUserId,
        threadId: toInt(remoteMessage.thread?.id) || localOldMessage.threadId,
        createdAt: toDate(remoteMessage.createdAt) || localOldMessage.createdAt,
        updatedAt:
            remoteMessage.updatedAt === undefined
                ? localOldMessage.updatedAt
                : new Date(remoteMessage.updatedAt),
    };

    if (remoteMessage.author) {
        currAppState = mergeUser(currAppState, remoteMessage.author);
    }

    if (remoteMessage.thread) {
        currAppState = mergeThread(currAppState, remoteMessage.thread);
    }

    currAppState.messages[remoteMessageId] = localNewMessage;
    return currAppState;
}

export function mergeTeam(
    currAppState: AppState,
    remoteTeam: RemoteTeam,
): AppState {
    const remoteTeamId = toInt(remoteTeam.id)!;
    const localOldTeam = currAppState.teams[remoteTeamId] || {};
    const localNewTeam: TeamState = {
        id: remoteTeamId,
        name: remoteTeam.name || localOldTeam.name,
        iconUrl:
            remoteTeam.iconUrl === undefined
                ? localOldTeam.iconUrl
                : remoteTeam.iconUrl,
        createdAt: toDate(remoteTeam.createdAt) || localOldTeam.createdAt,
        creatorUserId:
            toInt(remoteTeam.creator?.id) || localOldTeam.creatorUserId,
        ownerUserId: toInt(remoteTeam.owner?.id) || localOldTeam.ownerUserId,
    };

    if (remoteTeam.creator) {
        currAppState = mergeUser(currAppState, remoteTeam.creator);
    }

    if (remoteTeam.members) {
        currAppState = replaceTeamMembers(
            currAppState,
            remoteTeamId,
            remoteTeam.members,
        );
    }
    remoteTeam.tasks?.forEach((task) => {
        currAppState = mergeTask(currAppState, task);
    });

    if (remoteTeam.invitations) {
        currAppState = replaceTeamInvitations(
            currAppState,
            remoteTeamId,
            remoteTeam.invitations,
        );
    }

    if (remoteTeam.sprints) {
        currAppState = replaceTeamSprints(
            currAppState,
            remoteTeamId,
            remoteTeam.sprints,
        );
    }
    currAppState.teams[remoteTeamId] = localNewTeam;
    return currAppState;
}

export function mergeSprint(
    currAppState: AppState,
    remoteSprint: RemoteSprint,
): AppState {
    const remoteSprintId = toInt(remoteSprint.id)!;
    const localOldSprint = currAppState.sprints[remoteSprintId] || {};
    const localNewSprint: SprintState = {
        id: remoteSprintId,
        startAt: toDate(remoteSprint.startAt) || localOldSprint.startAt,
        endAt: toDate(remoteSprint.endAt) || localOldSprint.endAt,
        createdAt: toDate(remoteSprint.createdAt) || localOldSprint.createdAt,
        owningTeamId:
            toInt(remoteSprint.owningTeam?.id) || localOldSprint.owningTeamId,
    };

    if (remoteSprint.owningTeam) {
        currAppState = mergeTeam(currAppState, remoteSprint.owningTeam);
    }

    remoteSprint.tasks?.forEach((task) => {
        currAppState = mergeTask(currAppState, task);
    });
    if (remoteSprint.tasks) {
        const remainRelations = currAppState.sprintTaskRelations.filter(
            (relation) => relation.sprintId !== remoteSprintId,
        );

        const addedRelations = remoteSprint.tasks.map(
            (task) =>
                new SprintTaskRelationState(remoteSprintId, toInt(task.id)!),
        );
        currAppState.sprintTaskRelations =
            remainRelations.concat(addedRelations);
    }

    if (remoteSprint.participants) {
        currAppState = replaceSprintParticipants(
            currAppState,
            remoteSprintId,
            remoteSprint.participants,
        );
    }

    currAppState.sprints[remoteSprintId] = localNewSprint;
    return currAppState;
}

export function mergeInvitation(
    currAppState: AppState,
    remoteInvitation: RemoteInvitation,
): AppState {
    const remoteInvitationId = toInt(remoteInvitation.id)!;
    const localOldInvitation =
        currAppState.invitations[remoteInvitationId] || {};
    const localNewInvitation: InvitationState = {
        id: remoteInvitationId,
        senderUserId:
            toInt(remoteInvitation.sender?.id) ||
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
                : toInt(remoteInvitation.receiver?.id),
        teamId:
            toInt(remoteInvitation.joiningTeam?.id) ||
            localOldInvitation.teamId,
        expireAt: remoteInvitation.expireAt
            ? toDate(remoteInvitation.expireAt)!
            : localOldInvitation.expireAt,
        createdAt:
            toDate(remoteInvitation.createdAt) || localOldInvitation.createdAt,
        updatedAt:
            remoteInvitation.updatedAt === undefined
                ? localOldInvitation.updatedAt
                : toDate(remoteInvitation.updatedAt),
        status: remoteInvitation.status || localOldInvitation.status,
        code: remoteInvitation.code || localOldInvitation.code,
    };

    if (remoteInvitation.sender) {
        currAppState = mergeUser(currAppState, remoteInvitation.sender);
    }

    if (remoteInvitation.receiver) {
        currAppState = mergeUser(currAppState, remoteInvitation.receiver);
    }

    if (remoteInvitation.joiningTeam) {
        currAppState = mergeTeam(currAppState, remoteInvitation.joiningTeam);
    }

    currAppState.invitations[remoteInvitationId] = localNewInvitation;
    return currAppState;
}

export function mergeThread(
    currAppState: AppState,
    remoteThread: RemoteThread,
): AppState {
    remoteThread.messages?.forEach((message) => {
        currAppState = mergeMessage(currAppState, message);
    });
    return currAppState;
}

export function replaceTeamMembers(
    currAppState: AppState,
    teamId: number,
    teamMembers: RemoteTeamMember[],
): AppState {
    const newTeamMembers = teamMembers.map(
        (remoteTeamMember) =>
            new TeamMemberState(
                teamId,
                Number(remoteTeamMember.user.id),
                Duration.fromString(remoteTeamMember.weeklyBandwidth),
                toDate(remoteTeamMember.createdAt)!,
                toDate(remoteTeamMember.updatedAt),
            ),
    );
    let remainTeamMembers = currAppState.teamMembers.filter(
        (teamMember) => teamMember.teamId !== teamId,
    );
    currAppState.teamMembers = remainTeamMembers.concat(newTeamMembers);
    teamMembers.forEach((member) => {
        currAppState = mergeUser(currAppState, member.user);
    });
    return currAppState;
}

export function replaceTeamSprints(
    currAppState: AppState,
    teamId: number,
    sprints: RemoteSprint[],
): AppState {
    const newSprints: Record<number, SprintState> = {};
    for (let sprintId in currAppState.sprints) {
        const sprint = currAppState.sprints[sprintId];
        if (sprint.owningTeamId !== teamId) {
            newSprints[sprintId] = sprint;
        }
    }

    sprints.forEach((remoteSprint) => {
        currAppState = mergeSprint(currAppState, remoteSprint);
    });
    return currAppState;
}

function replaceAndMergeAwaitFor(
    currAppState: AppState,
    awaitingTaskId: number,
    awaitForTasks: RemoteTask[],
): AppState {
    const remainingRelations = currAppState.taskAwaitForRelations.filter(
        (relation) => relation.awaitingTaskId !== awaitingTaskId,
    );
    const newRelations = awaitForTasks.map(
        (task) =>
            new TaskAwaitForRelationState(awaitingTaskId, toInt(task.id)!),
    );
    currAppState.taskAwaitForRelations =
        remainingRelations.concat(newRelations);
    awaitForTasks.forEach((task) => {
        currAppState = mergeTask(currAppState, task);
    });
    return currAppState;
}

export function replaceTeamInvitations(
    currAppState: AppState,
    teamId: number,
    newInvitations: RemoteInvitation[],
): AppState {
    const invitations: Record<number, InvitationState> = {};
    for (let invitationId in currAppState.invitations) {
        const invitation = currAppState.invitations[invitationId];
        if (invitation.teamId !== teamId) {
            invitations[invitationId] = invitation;
        }
    }

    newInvitations.forEach((remoteInvitation) => {
        currAppState = mergeInvitation(currAppState, remoteInvitation);
    });
    return currAppState;
}

export function replaceSprintParticipants(
    appState: AppState,
    sprintId: number,
    newSprintParticipants: RemoteSprintParticipant[],
): AppState {
    const remainSprintParticipants = appState.sprintParticipants.filter(
        (sprintParticipant) => {
            return sprintParticipant.sprintId !== sprintId;
        },
    );
    const addedSprintParticipants = newSprintParticipants.map(
        (remoteSprintParticipant) =>
            new SprintParticipantState(
                sprintId,
                parseInt(remoteSprintParticipant.user.id),
                toDuration(remoteSprintParticipant.totalBandwidth)!,
                toDuration(remoteSprintParticipant.unusedBandwidth)!,
                toDate(remoteSprintParticipant.createdAt)!,
                toDate(remoteSprintParticipant.updatedAt),
            ),
    );

    newSprintParticipants.forEach((remoteParticipant) => {
        appState = mergeUser(appState, remoteParticipant.user);
    });
    appState.sprintParticipants = remainSprintParticipants.concat(
        addedSprintParticipants,
    );
    return appState;
}

export function deleteThread(appState: AppState, threadId: number): AppState {
    const newMessages: Record<number, MessageState> = {};
    for (let messageId in appState.messages) {
        const message = appState.messages[messageId];
        if (message.threadId === threadId) {
            continue;
        }

        newMessages[messageId] = message;
    }

    appState.messages = newMessages;
    return appState;
}

function toDuration(durationText?: string): Duration | undefined {
    if (!durationText) {
        return;
    }

    return Duration.fromString(durationText);
}
