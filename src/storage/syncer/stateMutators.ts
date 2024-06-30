import { Duration } from '@lib/time/duration';

import { RemoteApp } from '@core/client/entity/remoteApp';
import { RemoteAppInstallation } from '@core/client/entity/remoteAppInstallation';
import { RemoteAppSecret } from '@core/client/entity/remoteAppSecret';
import { RemoteAppVersion } from '@core/client/entity/remoteAppVersion';
import { RemoteAppVersionChange } from '@core/client/entity/remoteAppVersionChange';
import { RemoteClient } from '@core/client/entity/remoteClient';
import { RemoteGroup } from '@core/client/entity/remoteGroup';
import { RemoteInvitation } from '@core/client/entity/remoteInvitation';
import { RemoteMessage } from '@core/client/entity/remoteMessage';
import { RemoteMoney } from '@core/client/entity/remoteMoney';
import { RemotePhase } from '@core/client/entity/remotePhase';
import { RemoteProject } from '@core/client/entity/remoteProject';
import {
    RemoteAppRolloutType,
    RemoteRollout,
} from '@core/client/entity/remoteRollout';
import { RemoteRolloutActivator } from '@core/client/entity/remoteRolloutActivator';
import { RemoteRolloutVersionSelector } from '@core/client/entity/remoteRolloutVersionSelector';
import { RemoteSprint } from '@core/client/entity/remoteSprint';
import { RemoteSprintParticipant } from '@core/client/entity/remoteSprintParticipant';
import { RemoteStory } from '@core/client/entity/remoteStory';
import { RemoteTag } from '@core/client/entity/remoteTag';
import { RemoteTask } from '@core/client/entity/remoteTask';
import { RemoteTaskActivity } from '@core/client/entity/remoteTaskActivity';
import { RemoteTaskLink } from '@core/client/entity/remoteTaskLink';
import { RemoteTeam } from '@core/client/entity/remoteTeam';
import { RemoteTeamMember } from '@core/client/entity/remoteTeamMember';
import { RemoteThread } from '@core/client/entity/remoteThread';
import { RemoteUser } from '@core/client/entity/remoteUser';
import { TeamMemberClient } from '@core/client/teamMember.client';
import { Priority } from '@core/entity/priority';
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
import {
    DeleteSprintParticipantPayload,
    DeleteTaskAwaitForRelationPayload,
} from '@core/storage/syncer/payload';

import {
    ActivatorState,
    MaxViewersActivatorState,
    PercentageActivatorState,
    TimeRangeActivatorState,
} from '../states/activator.state';
import { AppInstallationState } from '../states/appInstallation.state';
import { AppSecretState } from '../states/appSecret.state';
import { AppVersionState } from '../states/appVersion.state';
import { AppVersionChangeState } from '../states/appVersionChange.state';
import { ClientState } from '../states/client.state';
import { DragTaskActivityState } from '../states/dragTaskActivity.state';
import { FilterGroupState, GroupState } from '../states/group.state';
import { PhaseState } from '../states/phase.state';
import { ProjectState } from '../states/project.state';
import { RolloutState } from '../states/rollout.state';
import { StoryState } from '../states/story.state';
import { TagState } from '../states/tag.state';
import { TaskActivityState } from '../states/taskActivity.state';
import { TaskLinkState } from '../states/taskLink.state';
import { ThirdPartyAppState } from '../states/thirdPartyApp.state';
import { VersionSelectorState } from '../states/versionSelector.state';
import { Mutation } from './mutation';
import { RemoteTeamMemberGroup } from '@core/client/entity/remoteTeamMemberGroup';
import { TeamMemberGroupState } from '../states/teamMemberGroup.state';
import { RemoteAttachmentList } from '@core/client/entity/remoteAttachmentList';
import { AttachmentListState } from '../states/attachmentList.state';
import { RemoteAttachment } from '@core/client/entity/remoteAttachment';
import { AttachmentState } from '../states/attachment.state';
import { TeamMemberGroupInvitationRelation } from '../states/teamMemberGroupInvitationRelation.state';
import { Attachment, AttachmentList, Message, Task, TaskLink } from '@teamyapp/proto';
import {
    attachmentListOwnerTypes,
    attachmentTypes,
    fromProtoDurationPtr,
    fromProtoTimePtr,
    taskStatuses,
} from './proto';

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

export function applyAttachmentListMutation(
    currState: AppState,
    mutation: Mutation,
): AppState {
    switch (mutation.mutationType) {
        case 'Create': {
            const attachmentList = AttachmentListState.fromMutationPayload(
                mutation.payload,
            );
            currState.attachmentLists[attachmentList.listId] = attachmentList;
            break;
        }
    }

    return currState;
}

export function applyAttachmentMutation(
    currState: AppState,
    mutation: Mutation,
): AppState {
    switch (mutation.mutationType) {
        case 'Create': {
            const attachment = AttachmentState.fromMutationPayload(
                mutation.payload,
            );
            currState.attachments[attachment.id] = attachment;
            break;
        }
    }

    return currState;
}

export function applyAppVersionMutation(
    currState: AppState,
    mutation: Mutation,
): AppState {
    switch (mutation.mutationType) {
        case 'Create':
        case 'Update': {
            const appVersion = AppVersionState.fromMutationPayload(
                mutation.payload,
            );
            currState.apps[appVersion.appId].versions[appVersion.number] =
                appVersion;
            break;
        }
        case 'Delete': {
            break;
        }
    }

    return currState;
}

export function applySprintMutation(
    currState: AppState,
    mutation: Mutation,
): AppState {
    switch (mutation.mutationType) {
        case 'Create':
        case 'Update': {
            const sprint = SprintState.fromMutationPayload(mutation.payload);
            currState.sprints[sprint.id] = sprint;
            break;
        }
        case 'Delete': {
            const sprintId = mutation.payload;
            delete currState.sprints[sprintId];
            break;
        }
    }

    return currState;
}

export function applyStoryMutation(
    currState: AppState,
    mutation: Mutation,
): AppState {
    switch (mutation.mutationType) {
        case 'Create':
        case 'Update': {
            const story = StoryState.fromMutationPayload(mutation.payload);
            currState.stories[story.id] = story;
            break;
        }
        case 'Delete': {
            const storyId = mutation.payload;
            delete currState.stories[storyId];
            break;
        }
    }

    return currState;
}

export function applyTaskLinkMutation(
    currState: AppState,
    mutation: Mutation,
): AppState {
    switch (mutation.mutationType) {
        case 'Create': {
            const taskLink = TaskLinkState.fromMutationPayload(
                mutation.payload,
            );
            currState.taskLinks[taskLink.id] = taskLink;
            break;
        }
        case 'Delete': {
            const taskLinkId = mutation.payload;
            delete currState.taskLinks[taskLinkId];
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

export function applyTeamMemberGroupMutation(
    currState: AppState,
    mutation: Mutation,
): AppState {
    switch (mutation.mutationType) {
        case 'Create':
        case 'Update': {
            const teamMemberGroup = TeamMemberGroupState.fromMutationPayload(
                mutation.payload,
            );
            currState.teamMemberGroups[teamMemberGroup.id] = teamMemberGroup;
            break;
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
    teamMemberClient: TeamMemberClient,
): Promise<AppState> {
    switch (mutation.mutationType) {
        case 'Create': {
            const addedTeamMember = TeamMemberState.fromMutationPayload(
                mutation.payload,
            );
            currState = addOrReplaceTeamMember(currState, addedTeamMember);
            const remoteTeamMembers = await teamMemberClient.getTeamMembers(
                `${addedTeamMember.teamId}`,
            );
            for (const remoteTeamMember of remoteTeamMembers) {
                currState = mergeUser(currState, remoteTeamMember.user);
            }

            break;
        }
        case 'Update': {
            const updatedTeamMember = TeamMemberState.fromMutationPayload(
                mutation.payload,
            );
            currState = addOrReplaceTeamMember(currState, updatedTeamMember);
            break;
        }
        case 'Delete': {
            const deletedTeamMember = TeamMemberState.fromMutationPayload(
                mutation.payload,
            );
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

export function applyAppVersionChangeMutation(
    currState: AppState,
    mutation: Mutation,
): AppState {
    switch (mutation.mutationType) {
        case 'Create': {
            const appVersionChange = AppVersionChangeState.fromMutationPayload(
                mutation.payload,
            );
            currState.appVersionChanges[appVersionChange.id] = appVersionChange;
            break;
        }
    }

    return currState;
}

function addOrReplaceTeamMember(
    currState: AppState,
    newTeamMember: TeamMemberState,
): AppState {
    currState.teamMembers = currState.teamMembers.filter(
        (teamMember) =>
            !(
                teamMember.teamId === newTeamMember.teamId &&
                teamMember.userId === newTeamMember.userId
            ),
    );
    currState.teamMembers = currState.teamMembers.concat(newTeamMember);
    return currState;
}

export function applyTaskActivityMutation(
    currState: AppState,
    mutation: Mutation,
): AppState {
    switch (mutation.mutationType) {
        case 'Update': {
            const updatedTaskActivity = TaskActivityState.fromMutationPayload(
                mutation.payload,
            );
            if (mutation.payload.DragTaskActivity.Client) {
                const clientState = ClientState.fromMutationPayload(
                    mutation.payload.DragTaskActivity.Client,
                );
                currState.clients[clientState.id] = clientState;
            }

            const index = currState.taskActivities.findIndex(
                ({ taskId, teamId }) => {
                    return (
                        teamId === updatedTaskActivity.teamId &&
                        taskId === updatedTaskActivity.taskId
                    );
                },
            );

            if (index !== -1) {
                currState.taskActivities[index] = updatedTaskActivity;
            } else {
                currState.taskActivities.push(updatedTaskActivity);
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

export function applyTeamMemberGroupInvitationRelationMutation(
    currState: AppState,
    mutation: Mutation,
): AppState {
    switch (mutation.mutationType) {
        case 'Create': {
            const relation =
                TeamMemberGroupInvitationRelation.fromMutationPayload(
                    mutation.payload,
                );
            currState.teamMemberGroupInvitationRelations =
                currState.teamMemberGroupInvitationRelations.concat(relation);
            break;
        }
    }

    return currState;
}
export function applySprintParticipantMutation(
    currState: AppState,
    mutation: Mutation,
): AppState {
    switch (mutation.mutationType) {
        case 'Create':
        case 'Update': {
            const newSprintParticipant =
                SprintParticipantState.fromMutationPayload(mutation.payload);
            currState.sprintParticipants = currState.sprintParticipants.filter(
                (sprintParticipant) =>
                    !(
                        sprintParticipant.sprintId ===
                            newSprintParticipant.sprintId &&
                        sprintParticipant.userId === newSprintParticipant.userId
                    ),
            );
            currState.sprintParticipants =
                currState.sprintParticipants.concat(newSprintParticipant);
            break;
        }
        case 'Delete': {
            const payload = DeleteSprintParticipantPayload.fromMutationPayload(
                mutation.payload,
            );
            currState.sprintParticipants = currState.sprintParticipants.filter(
                (sprintParticipant) =>
                    !(
                        sprintParticipant.sprintId === payload.sprintId &&
                        sprintParticipant.userId === payload.userId
                    ),
            );
            break;
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

export function mergeClient(
    currAppState: AppState,
    remoteClient: RemoteClient,
): AppState {
    const clientId = Number(remoteClient.id);
    const localOldClient: ClientState = currAppState.clients[clientId] || {};
    const localNewClient: ClientState = {
        id: clientId,
        userId: toInt(remoteClient.user.id) || localOldClient.userId,
    };

    currAppState.clients[clientId] = localNewClient;
    return currAppState;
}

export function mergeAttachmentList(
    currAppState: AppState,
    remoteAttachmentList: RemoteAttachmentList,
): AppState {
    const attachmentListId = toInt(remoteAttachmentList.listId)!;
    const localOldAttachmentList: AttachmentListState =
        currAppState.attachmentLists[attachmentListId] || {};
    const localNewAttachmentList: AttachmentListState = {
        ownerType:
            remoteAttachmentList.ownerType || localOldAttachmentList.ownerType,
        ownerId:
            toInt(remoteAttachmentList.ownerId) ||
            localOldAttachmentList.ownerId,
        listId: attachmentListId,
        listLabel:
            remoteAttachmentList.listLabel || localOldAttachmentList.listLabel,
        createdAt:
            toDate(remoteAttachmentList.createdAt) ||
            localOldAttachmentList.createdAt,
        updatedAt:
            remoteAttachmentList.updatedAt === undefined
                ? localOldAttachmentList.updatedAt
                : toDate(remoteAttachmentList.updatedAt),
    };

    remoteAttachmentList.attachments?.forEach((remoteAttachment) => {
        currAppState = mergeAttachment(currAppState, remoteAttachment);
    });
    currAppState.attachmentLists[attachmentListId] = localNewAttachmentList;
    return currAppState;
}

export function mergeAttachment(
    currAppState: AppState,
    remoteAttachment: RemoteAttachment,
): AppState {
    const attachmentId = toInt(remoteAttachment.id)!;
    const localOldAttachment = currAppState.attachments[attachmentId] || {};
    const localNewAttachment = {
        id: attachmentId,
        type: remoteAttachment.type || localOldAttachment.type,
        size: remoteAttachment.size || remoteAttachment.size,
        attachmentListId: toInt(remoteAttachment.attachmentList.listId)!,
        url: remoteAttachment.url || localOldAttachment.url,
        createdAt:
            toDate(remoteAttachment.createdAt) || localOldAttachment.createdAt,
    };
    currAppState.attachments[attachmentId] = localNewAttachment;
    return currAppState;
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

export function mergeAppRolloutRelation(
    currAppState: AppState,
    appId: number,
    rolloutId: number,
    type: RemoteAppRolloutType,
): AppState {
    if (
        !currAppState.appRolloutRelations.some((appRolloutRelation) => {
            return (
                appRolloutRelation.appId === appId &&
                appRolloutRelation.rolloutId === rolloutId
            );
        })
    ) {
        currAppState.appRolloutRelations.push({
            appId: appId,
            rolloutId: rolloutId,
            type: type,
        });
    }

    return currAppState;
}

export function mergeProject(
    currAppState: AppState,
    remoteProject: RemoteProject,
): AppState {
    const remoteProjectId = toInt(remoteProject.id)!;
    const localOldProject = currAppState.projects[remoteProjectId] || {};
    const localNewProject: ProjectState = {
        id: remoteProjectId,
        name: remoteProject.name || localOldProject.name,
        expectedStartAt:
            toDate(remoteProject.expectedStartAt) ||
            localOldProject.expectedStartAt,
        actualStartAt:
            remoteProject.actualStartAt === undefined
                ? localOldProject.actualStartAt
                : toDate(remoteProject.actualStartAt),
        expectedEndAt:
            toDate(remoteProject.expectedEndAt) ||
            localOldProject.expectedEndAt,
        actualEndAt:
            remoteProject.actualEndAt === undefined
                ? localOldProject.actualEndAt
                : toDate(remoteProject.actualEndAt),
        createdAt: toDate(remoteProject.createdAt) || localOldProject.createdAt,
        creatorId: toInt(remoteProject.creator.id) || localOldProject.creatorId,
        updatedAt:
            remoteProject.updatedAt === undefined
                ? localOldProject.updatedAt
                : toDate(remoteProject.updatedAt),
        teamId: toInt(remoteProject.team.id) || localOldProject.teamId,
        iconUrl: remoteProject.iconUrl === undefined ? localOldProject.iconUrl : remoteProject.iconUrl,
        color: remoteProject.color === undefined ? localOldProject.color : remoteProject.color,
    };

    remoteProject.phases?.forEach((phase) => {
        currAppState = mergePhase(currAppState, phase);
        currAppState = mergeProjectPhaseRelation(
            currAppState,
            remoteProject.id,
            phase.id,
        );
    });

    remoteProject.stories?.forEach((story) => {
        currAppState = mergeStory(currAppState, story);
        currAppState = mergeProjectStoryRelation(
            currAppState,
            remoteProject.id,
            story.id,
        );
    });

    currAppState = mergeTeam(currAppState, remoteProject.team);
    currAppState.projects[remoteProjectId] = localNewProject;
    return currAppState;
}

export function mergeProjectStoryRelation(
    currAppState: AppState,
    remoteProjectId: string,
    remoteStoryId: string,
): AppState {
    const projectId = toInt(remoteProjectId)!;
    const storyId = toInt(remoteStoryId)!;

    if (
        !currAppState.projectStoryRelations.some((projectStoryRelation) => {
            return (
                projectStoryRelation.projectId === projectId &&
                projectStoryRelation.storyId === storyId
            );
        })
    ) {
        currAppState.projectStoryRelations.push({
            projectId: projectId,
            storyId: storyId,
        });
    }

    return currAppState;
}

export function mergePhaseStoryRelation(
    currAppState: AppState,
    remotePhaseId: string,
    remoteStoryId: string,
): AppState {
    const phaseId = toInt(remotePhaseId)!;
    const storyId = toInt(remoteStoryId)!;

    if (
        !currAppState.phaseStoryRelations.some((phaseStoryRelation) => {
            return (
                phaseStoryRelation.phaseId === phaseId &&
                phaseStoryRelation.storyId === storyId
            );
        })
    ) {
        currAppState.phaseStoryRelations.push({
            phaseId: phaseId,
            storyId: storyId,
        });
    }

    return currAppState;
}

export function mergeStoryTaskRelation(
    currAppState: AppState,
    remoteStoryId: string,
    remoteTaskId: string,
): AppState {
    const storyId = toInt(remoteStoryId)!;
    const taskId = toInt(remoteTaskId)!;

    if (
        !currAppState.storyTaskRelations.some((storyTaskRelation) => {
            return (
                storyTaskRelation.storyId === storyId &&
                storyTaskRelation.taskId === taskId
            );
        })
    ) {
        currAppState.storyTaskRelations.push({
            storyId: storyId,
            taskId: taskId,
        });
    }

    return currAppState;
}

export function mergeProjectPhaseRelation(
    currAppState: AppState,
    remoteProjectId: string,
    remotePhaseId: string,
): AppState {
    const projectId = toInt(remoteProjectId)!;
    const phaseId = toInt(remotePhaseId)!;

    if (
        !currAppState.projectPhaseRelations.some((projectPhaseRelation) => {
            return (
                projectPhaseRelation.projectId === projectId &&
                projectPhaseRelation.phaseId === phaseId
            );
        })
    ) {
        currAppState.projectPhaseRelations.push({
            projectId: projectId,
            phaseId: phaseId,
        });
    }

    return currAppState;
}

export function mergePhase(
    currAppState: AppState,
    remotePhase: RemotePhase,
): AppState {
    const remotePhaseId = toInt(remotePhase.id)!;
    const localOldPhase = currAppState.phases[remotePhaseId] || {};
    const localNewPhase: PhaseState = {
        id: remotePhaseId,
        name: remotePhase.name || localOldPhase.name,
        status: remotePhase.status || localOldPhase.status,
        expectedStartAt:
            toDate(remotePhase.expectedStartAt) ||
            localOldPhase.expectedStartAt,
        actualStartAt:
            remotePhase.actualStartAt === undefined
                ? localOldPhase.actualStartAt
                : toDate(remotePhase.actualStartAt),
        expectedEndAt:
            toDate(remotePhase.expectedEndAt) || localOldPhase.expectedEndAt,
        actualEndAt:
            remotePhase.actualEndAt === undefined
                ? localOldPhase.actualEndAt
                : toDate(remotePhase.actualEndAt),
        creatorId: toInt(remotePhase.creator.id) || localOldPhase.creatorId,
        createdAt: toDate(remotePhase.createdAt) || localOldPhase.createdAt,
        updatedAt:
            remotePhase.updatedAt === undefined
                ? localOldPhase.updatedAt
                : toDate(remotePhase.updatedAt),
    };

    remotePhase.stories?.forEach((story) => {
        currAppState = mergeStory(currAppState, story);
        currAppState = mergePhaseStoryRelation(
            currAppState,
            remotePhase.id,
            story.id,
        );
    });

    currAppState.phases[remotePhaseId] = localNewPhase;
    return currAppState;
}

export function mergeStory(
    currAppState: AppState,
    remoteStory: RemoteStory,
): AppState {
    const remoteStoryId = toInt(remoteStory.id)!;
    const localOldStory = currAppState.stories[remoteStoryId] || {};
    const localNewStory: StoryState = {
        id: remoteStoryId,
        name: remoteStory.name || localOldStory.name,
        ownerId:
            remoteStory.owner === undefined
                ? localOldStory.ownerId
                : toInt(remoteStory.owner?.id),
        status: remoteStory.status || localOldStory.status,
        priority: remoteStory.priority || localOldStory.priority,
        creatorId: toInt(remoteStory.creator.id) || localOldStory.creatorId,
        createdAt: toDate(remoteStory.createdAt) || localOldStory.createdAt,
        updatedAt:
            remoteStory.updatedAt === undefined
                ? localOldStory.updatedAt
                : toDate(remoteStory.updatedAt),
        isPlanned:
            remoteStory.isPlanned === undefined
                ? localOldStory.isPlanned
                : remoteStory.isPlanned,
    };

    remoteStory.tasks?.forEach((task) => {
        currAppState = mergeTask(currAppState, task);
        currAppState = mergeStoryTaskRelation(
            currAppState,
            remoteStory.id,
            task.id,
        );
    });

    currAppState.stories[remoteStoryId] = localNewStory;
    return currAppState;
}

export function mergeApp(
    currAppState: AppState,
    remoteApp: RemoteApp,
    remoteTeamId: number,
): AppState {
    const remoteAppId = toInt(remoteApp.id)!;
    const localOldApp: ThirdPartyAppState =
        currAppState.apps[remoteAppId] || {};

    const localNewApp: ThirdPartyAppState = {
        id: remoteAppId,
        totalInstallations:
            remoteApp.totalInstallations == undefined
                ? localOldApp.totalInstallations
                : remoteApp.totalInstallations,
        managedByTeamId:
            toInt(remoteApp.managedByTeam?.id) || localOldApp.managedByTeamId,
        secretIds:
            remoteApp.secrets?.map((secret) => toInt(secret.id)!) ||
            localOldApp.secretIds,
        tagIds: remoteApp.tags
            ? new Set(remoteApp.tags?.map((tag) => toInt(tag.id)!))
            : localOldApp.tagIds,
        versions: localOldApp.versions || {},
    };

    if (remoteApp.latestVersionForTeam) {
        currAppState = mergeTeamAppVersion(
            currAppState,
            remoteTeamId,
            remoteApp.latestVersionForTeam,
        );
    }

    if (remoteApp.managedByTeam) {
        currAppState = mergeTeam(currAppState, remoteApp.managedByTeam);
    }

    remoteApp.secrets?.forEach((secret) => {
        currAppState = mergeAppSecret(currAppState, secret);
    });

    remoteApp.installations?.forEach((installation) => {
        currAppState = mergeAppInstallation(currAppState, installation);
    });

    remoteApp.tags?.forEach((tag) => {
        currAppState = mergeTag(currAppState, tag);
    });

    currAppState.apps[remoteAppId] = localNewApp;

    remoteApp.versions?.forEach((version) => {
        currAppState = mergeAppVersion(currAppState, remoteApp.id, version);
    });

    remoteApp.userRollouts?.forEach((rollout) => {
        currAppState = mergeRollout(currAppState, rollout);
        currAppState = mergeAppRolloutRelation(
            currAppState,
            remoteAppId,
            toInt(rollout.id)!,
            'USER',
        );
    });

    remoteApp.teamRollouts?.forEach((rollout) => {
        currAppState = mergeRollout(currAppState, rollout);
        currAppState = mergeAppRolloutRelation(
            currAppState,
            remoteAppId,
            toInt(rollout.id)!,
            'TEAM',
        );
    });

    remoteApp.groups?.forEach((group) => {
        currAppState = mergeGroup(currAppState, group, remoteAppId);
    });

    return currAppState;
}

export function mergeAppVersion(
    currAppState: AppState,
    remoteAppId: string,
    version: RemoteAppVersion,
): AppState {
    const appId = toInt(remoteAppId)!;
    if (version.app) {
        currAppState = mergeApp(currAppState, version.app, appId);
    }

    const app = currAppState.apps[appId];
    const localOldVersion = app.versions[version.number] || {};

    app.versions[version.number] = {
        number: version.number,
        appName: version.appName || localOldVersion.appName,
        appId: appId,
        createdAt: toDate(version.createdAt) || localOldVersion.createdAt,
        creatorUserId:
            version.createdBy !== undefined
                ? toInt(version.createdBy.id)!
                : localOldVersion.creatorUserId,
        description: version.description || localOldVersion.description,
        status: version.status || localOldVersion.status,
        locked: version.locked,
        hasUiExtension: version.hasUiExtension,
        errorMessage: version.errorMessage || localOldVersion.errorMessage,
    };

    version.changes?.forEach((change) => {
        currAppState = mergeAppVersionChange(currAppState, change);
    });

    version.prices?.forEach((price) => {
        currAppState = mergeAppVersionPrice(
            currAppState,
            appId,
            version.number,
            price,
        );
    });

    return currAppState;
}

export function mergeAppVersionPrice(
    currAppState: AppState,
    remoteAppId: number,
    versionNumber: number,
    price: RemoteMoney,
) {
    const localAppVersionPrice = currAppState.appVersionPrices.find(
        (appVersionPrice) => {
            return (
                appVersionPrice.appId === remoteAppId &&
                appVersionPrice.versionNumber === versionNumber &&
                appVersionPrice.currency === price.currency
            );
        },
    );

    if (!localAppVersionPrice) {
        currAppState.appVersionPrices.push({
            appId: remoteAppId,
            versionNumber: versionNumber,
            currency: price.currency,
            price: price.amount,
        });
    } else {
        localAppVersionPrice.price = price.amount;
    }

    return currAppState;
}

export function mergeAppVersionChange(
    currAppState: AppState,
    appVersionChange: RemoteAppVersionChange,
): AppState {
    const appVersionChangeId = toInt(appVersionChange.id)!;
    const localOldAppVersionChange =
        currAppState.appVersionChanges[appVersionChangeId] || {};

    const localNewAppVersionChange: AppVersionChangeState = {
        id: appVersionChangeId,
        versionNumber:
            appVersionChange.appVersion.number ||
            localOldAppVersionChange.versionNumber,
        appId:
            toInt(appVersionChange.appVersion.app.id)! ||
            localOldAppVersionChange.appId,
        change: appVersionChange.change || localOldAppVersionChange.change,
    };

    currAppState.appVersionChanges[appVersionChangeId] =
        localNewAppVersionChange;
    return currAppState;
}

export function mergeTeamAppVersion(
    currAppState: AppState,
    teamId: number,
    version: RemoteAppVersion,
): AppState {
    for (let teamAppVersion of currAppState.teamAppVersions) {
        if (
            teamAppVersion.teamId === teamId &&
            teamAppVersion.appId === toInt(version.app.id)
        ) {
            teamAppVersion.appVersion = version.number;
            return currAppState;
        }
    }

    currAppState.teamAppVersions.push({
        teamId: teamId,
        appId: toInt(version.app.id)!,
        appVersion: version.number,
    });

    return currAppState;
}

export function mergeAppSecret(
    currAppState: AppState,
    remoteAppSecret: RemoteAppSecret,
): AppState {
    const remoteAppSecretId = toInt(remoteAppSecret.id)!;
    const localOldAppSecret = currAppState.appSecrets[remoteAppSecretId] || {};
    const localNewAppSecret: AppSecretState = {
        id: remoteAppSecretId,
        name: remoteAppSecret.name || localOldAppSecret.name,
        addedAt: toDate(remoteAppSecret.addedAt) || localOldAppSecret.addedAt,
        addedByUserId:
            toInt(remoteAppSecret.addedBy.id) ||
            localOldAppSecret.addedByUserId,
        appId: toInt(remoteAppSecret.app.id) || localOldAppSecret.appId,
        lastUsedAt:
            toDate(remoteAppSecret.lastUsedAt) || localOldAppSecret.lastUsedAt,
        token: remoteAppSecret.token,
    };

    currAppState.appSecrets[remoteAppSecretId] = localNewAppSecret;
    return currAppState;
}

export function mergeTag(
    currAppState: AppState,
    remoteTag: RemoteTag,
): AppState {
    const remoteTagId = toInt(remoteTag.id)!;
    const localOldTag = currAppState.tags[remoteTagId] || {};
    const localNewTag: TagState = {
        id: remoteTagId,
        value: remoteTag.value || localOldTag.value,
    };

    currAppState.tags[remoteTagId] = localNewTag;
    return currAppState;
}

export function mergeRollout(
    currAppState: AppState,
    remoteRollout: RemoteRollout,
): AppState {
    const remoteRolloutId = toInt(remoteRollout.id)!;
    const localOldRollout = currAppState.rollouts[remoteRolloutId] || {};
    const localNewRollout: RolloutState = {
        id: remoteRolloutId,
        name: remoteRollout.name || localOldRollout.name,
        activatorId:
            toInt(remoteRollout.activator.id) || localOldRollout.activatorId,
        versionSelectorId:
            toInt(remoteRollout.versionSelector.id) ||
            localOldRollout.versionSelectorId,
        isEnabled: remoteRollout.isEnabled,
        locked: remoteRollout.locked,
        createdAt: toDate(remoteRollout.createdAt) || localOldRollout.createdAt,
        updatedAt: toDate(remoteRollout.updatedAt) || localOldRollout.updatedAt,
    };

    if (remoteRollout.activator) {
        currAppState = mergeActivator(currAppState, remoteRollout.activator);
    }

    if (remoteRollout.versionSelector) {
        currAppState = mergeVersionSelector(
            currAppState,
            remoteRollout.versionSelector,
        );
    }

    currAppState.rollouts[remoteRolloutId] = localNewRollout;
    return currAppState;
}

export function mergeActivator(
    currAppState: AppState,
    remoteActivator: RemoteRolloutActivator,
): AppState {
    const remoteActivatorId = toInt(remoteActivator.id)!;
    const localOldActivator = currAppState.activators[remoteActivatorId] || {};
    const localNewActivator: ActivatorState = {
        id: remoteActivatorId,
        type: remoteActivator.type || localOldActivator.type,
        createdAt:
            toDate(remoteActivator.createdAt) || localOldActivator.createdAt,
        updatedAt:
            toDate(remoteActivator.updatedAt) || localOldActivator.updatedAt,
    };

    const type = remoteActivator.type || localOldActivator.type;
    switch (type) {
        case 'STATIC':
            break;
        case 'TIME_RANGE':
            const localOldTimeRangeActivator =
                currAppState.timeRangeActivators[remoteActivatorId] || {};
            const localNewTimeRangeActivator: TimeRangeActivatorState = {
                startAt:
                    toDate(remoteActivator.startAt) ||
                    localOldTimeRangeActivator.startAt,
                endAt:
                    toDate(remoteActivator.endAt) ||
                    localOldTimeRangeActivator.endAt,
            };
            currAppState.timeRangeActivators[remoteActivatorId] =
                localNewTimeRangeActivator;
            break;
        case 'MAX_VIEWERS':
            const localOldMaxViewersActivator =
                currAppState.maxViewersActivators[remoteActivatorId] || {};
            const localNewMaxViewersActivator: MaxViewersActivatorState = {
                maxViewers:
                    remoteActivator.maxViewers ||
                    localOldMaxViewersActivator.maxViewers,
            };
            currAppState.maxViewersActivators[remoteActivatorId] =
                localNewMaxViewersActivator;
            break;
        case 'PERCENTAGE':
            const localOldPercentageActivator =
                currAppState.percentageActivators[remoteActivatorId] || {};
            const localNewPercentageActivator: PercentageActivatorState = {
                percentage:
                    remoteActivator.percentage ||
                    localOldPercentageActivator.percentage,
            };
            currAppState.percentageActivators[remoteActivatorId] =
                localNewPercentageActivator;
            break;
    }

    currAppState.activators[remoteActivatorId] = localNewActivator;
    return currAppState;
}

export function mergeVersionSelector(
    currAppState: AppState,
    remoteVersionSelector: RemoteRolloutVersionSelector,
): AppState {
    const remoteVersionSelectorId = toInt(remoteVersionSelector.id)!;
    const localOldVersionSelector =
        currAppState.versionSelectors[remoteVersionSelectorId] || {};
    const localNewVersionSelector: VersionSelectorState = {
        id: remoteVersionSelectorId,
        type: remoteVersionSelector.type || localOldVersionSelector.type,
        createdAt:
            toDate(remoteVersionSelector.createdAt) ||
            localOldVersionSelector.createdAt,
        updatedAt:
            toDate(remoteVersionSelector.updatedAt) ||
            localOldVersionSelector.updatedAt,
    };

    currAppState.versionSelectorVersionRelations =
        currAppState.versionSelectorVersionRelations.filter(
            (versionSelectorVersionRelation) => {
                return (
                    versionSelectorVersionRelation.versionSelectorId !==
                    remoteVersionSelectorId
                );
            },
        );

    const type = remoteVersionSelector.type || localOldVersionSelector.type;
    switch (type) {
        case 'STATIC':
            currAppState.versionSelectorVersionRelations.push({
                versionSelectorId: remoteVersionSelectorId,
                versionNumber: remoteVersionSelector.versionNumber!,
            });
            break;
        case 'EXPERIMENT':
            remoteVersionSelector.versionNumbers?.forEach((versionNumber) => {
                currAppState.versionSelectorVersionRelations.push({
                    versionSelectorId: remoteVersionSelectorId,
                    versionNumber: versionNumber,
                });
            });
            break;
    }

    currAppState.versionSelectors[remoteVersionSelectorId] =
        localNewVersionSelector;
    return currAppState;
}

export function mergeGroup(
    currAppState: AppState,
    remoteGroup: RemoteGroup,
    remoteAppId: number,
): AppState {
    const remoteGroupId = toInt(remoteGroup.id)!;
    const localOldGroup = currAppState.groups[remoteGroupId] || {};
    const localNewGroup: GroupState = {
        id: remoteGroupId,
        type: remoteGroup.type || localOldGroup.type,
        memberType: remoteGroup.memberType || localOldGroup.memberType,
        name: remoteGroup.name || localOldGroup.name,
        locked: remoteGroup.locked,
        createdAt: toDate(remoteGroup.createdAt) || localOldGroup.createdAt,
        updatedAt: toDate(remoteGroup.updatedAt),
    };

    if (remoteGroup.type === 'FILTER') {
        const localOldFilterGroup =
            currAppState.filterGroups[remoteGroupId] || {};
        const localNewFilterGroup: FilterGroupState = {
            filter: remoteGroup.filter || localOldFilterGroup.filter,
        };
        currAppState.filterGroups[remoteGroupId] = localNewFilterGroup;
    } else {
        remoteGroup.teams?.forEach((team) => {
            currAppState = mergeTeam(currAppState, team);
        });
        remoteGroup.users?.forEach((user) => {
            currAppState = mergeUser(currAppState, user);
        });

        const memberAttr =
            remoteGroup.memberType === 'USER' ? 'users' : 'teams';
        const otherGroupMemberRelations =
            currAppState.groupMemberRelations.filter((groupMemberRelation) => {
                return groupMemberRelation.groupId !== remoteGroupId;
            });
        const remoteGroupMemberRelations =
            remoteGroup[memberAttr]?.map((member) => {
                return {
                    groupId: remoteGroupId,
                    memberId: toInt(member.id)!,
                };
            }) || [];

        currAppState.groupMemberRelations = [
            ...otherGroupMemberRelations,
            ...remoteGroupMemberRelations,
        ];
    }

    if (remoteAppId) {
        if (
            !currAppState.appGroupRelations.some((appGroupRelation) => {
                return (
                    appGroupRelation.appId === remoteAppId &&
                    appGroupRelation.groupId === remoteGroupId
                );
            })
        ) {
            currAppState.appGroupRelations.push({
                appId: remoteAppId,
                groupId: remoteGroupId,
            });
        }
    }
    remoteGroup.groupRolloutRelations?.forEach((remoteGroupRolloutRelation) => {
        currAppState = mergeGroupRolloutRelation(
            currAppState,
            remoteGroupId,
            toInt(remoteGroupRolloutRelation.rollout.id)!,
            remoteGroupRolloutRelation.orderIndex,
        );
    });

    currAppState.groups[remoteGroupId] = localNewGroup;
    return currAppState;
}

export function mergeGroupRolloutRelation(
    currAppState: AppState,
    remoteGroupId: number,
    remoteRolloutId: number,
    orderIndex: number,
) {
    const isRelationExisted = currAppState.groupRolloutRelations.some(
        (groupRolloutRelation) => {
            return (
                groupRolloutRelation.groupId === remoteGroupId &&
                groupRolloutRelation.rolloutId === remoteRolloutId
            );
        },
    );

    if (!isRelationExisted) {
        currAppState.groupRolloutRelations.push({
            groupId: remoteGroupId,
            rolloutId: remoteRolloutId,
            orderIndex,
        });
    }

    return currAppState;
}

export function mergeAppInstallation(
    currAppState: AppState,
    remoteAppInstallation: RemoteAppInstallation,
): AppState {
    const remoteAppInstallationId = toInt(remoteAppInstallation.id)!;
    const localOldAppInstallation =
        currAppState.appInstallations[remoteAppInstallationId] || {};

    const localNewAppInstallation: AppInstallationState = {
        id: remoteAppInstallationId,
        installedTeamId:
            toInt(remoteAppInstallation.installedTeam.id) ||
            localOldAppInstallation.installedTeamId,
        appId:
            toInt(remoteAppInstallation.activeAppVersion?.app.id) ||
            localOldAppInstallation.appId,
        appVersionNumber:
            remoteAppInstallation.activeAppVersion?.number ||
            localOldAppInstallation.appVersionNumber,
    };

    if (remoteAppInstallation.activeAppVersion) {
        mergeAppVersion(
            currAppState,
            remoteAppInstallation.activeAppVersion.app.id,
            remoteAppInstallation.activeAppVersion,
        );
    }

    currAppState.appInstallations[remoteAppInstallationId] =
        localNewAppInstallation;

    return currAppState;
}

export function setTask(currAppState: AppState, task: Task): AppState {
    const localNewTask: TaskState = {
        id: task.id,
        goal: task.goal,
        context: task.context,
        creatorUserId: task.creatorUserId,
        ownerUserId: task.ownerUserId,
        owningTeamId: task.owningTeamId,
        status: taskStatuses[task.status],
        isScheduled: task.isScheduled,
        isPlanned: task.isPlanned,
        commentsThreadId:
            task.commentsThreadId,
        createdAt: fromProtoTimePtr(task.createdAt)!,
        updatedAt: fromProtoTimePtr(task.updatedAt),
        deliveredAt:
            fromProtoTimePtr(task.deliveredAt),
        effort: fromProtoDurationPtr(task.effort),
        dueAt: fromProtoTimePtr(task.dueAt),
    };
    currAppState.tasks[task.id] = localNewTask;
    return currAppState;
}

export function setAttachment(
    currAppState: AppState,
    attachment: Attachment,
): AppState {
    const localNewAttachment: AttachmentState = {
        id: attachment.id,
        type: attachmentTypes[attachment.type],
        url: attachment.url,
        size: attachment.size,
        createdAt: fromProtoTimePtr(attachment.createdAt)!,
        attachmentListId: attachment.attachmentListId,
    };

    currAppState.attachments[attachment.id] = localNewAttachment;
    return currAppState;
}

export function setTaskLink(
    currAppState: AppState,
    taskLink: TaskLink,
): AppState {
    const localNewTaskLink: TaskLinkState = {
        id: taskLink.id,
        taskId: taskLink.taskId,
        title: taskLink.title,
        previewTitle: taskLink.previewTitle,
        url: taskLink.url,
        iconUrl: taskLink.iconUrl,
        iconHoverUrl: taskLink.iconHoverUrl,
    };
    currAppState.taskLinks[taskLink.id] = localNewTaskLink;
    return currAppState;
}

export function setAttachmentList(
    currAppState: AppState,
    attachmentList: AttachmentList,
): AppState {
    const localNewAttachmentList: AttachmentListState = {
        ownerType: attachmentListOwnerTypes[attachmentList.ownerType],
        ownerId: attachmentList.ownerId,
        listLabel: attachmentList.listLabel,
        listId: attachmentList.listId,
        createdAt: fromProtoTimePtr(attachmentList.createdAt)!,
        updatedAt: fromProtoTimePtr(attachmentList.updatedAt),
    };
    currAppState.attachmentLists[attachmentList.listId] = localNewAttachmentList;
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
        isScheduled:
            remoteTask.isScheduled === undefined
                ? localOldTask?.isScheduled
                : remoteTask.isScheduled,
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
        priority:
            remoteTask.priority === undefined
                ? localOldTask.priority
                : (remoteTask.priority as Priority),
    };

    remoteTask.links?.forEach((link) => {
        currAppState = mergeTaskLink(currAppState, link);
    });

    if (remoteTask.creator) {
        currAppState = mergeUser(currAppState, remoteTask.creator);
    }

    if (remoteTask.contextAttachmentList) {
        currAppState = mergeAttachmentList(
            currAppState,
            remoteTask.contextAttachmentList,
        );
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


export function setMessage(
    currAppState: AppState,
    message: Message,
): AppState {
    const localNewMessage: MessageState = {
        id: message.id,
        body: message.body,
        authorUserId: message.authorUserId,
        threadId: message.threadId,
        createdAt: fromProtoTimePtr(message.createdAt)!,
        updatedAt: fromProtoTimePtr(message.updatedAt),
    };
    currAppState.messages[message.id] = localNewMessage;
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

export function mergeTeamMemberGroup(
    currAppState: AppState,
    remoteTeamMemberGroup: RemoteTeamMemberGroup,
): AppState {
    const remoteTeamMemberGroupId = toInt(remoteTeamMemberGroup.id)!;
    const localOldTeamMemberGroup =
        currAppState.teamMemberGroups[remoteTeamMemberGroupId] || {};
    const localNewTeamMemberGroup: TeamMemberGroupState = {
        id: remoteTeamMemberGroupId,
        name: remoteTeamMemberGroup.name || localOldTeamMemberGroup.name,
        orderIndex:
            remoteTeamMemberGroup.orderIndex === undefined
                ? localOldTeamMemberGroup.orderIndex
                : remoteTeamMemberGroup.orderIndex,
        teamId:
            toInt(remoteTeamMemberGroup.team?.id) ||
            localOldTeamMemberGroup.teamId,
        createdAt:
            toDate(remoteTeamMemberGroup.createdAt) ||
            localOldTeamMemberGroup.createdAt,
        updatedAt:
            remoteTeamMemberGroup.updatedAt === undefined
                ? localOldTeamMemberGroup.updatedAt
                : toDate(remoteTeamMemberGroup.updatedAt),
    };

    if (remoteTeamMemberGroup.team) {
        currAppState = mergeTeam(currAppState, remoteTeamMemberGroup.team);
    }

    remoteTeamMemberGroup.members?.forEach((member) => {
        currAppState = mergeUser(currAppState, member);
        currAppState = mergeTeamMemberGroupUserRelation(
            currAppState,
            remoteTeamMemberGroup.id,
            member.id,
        );
    });

    remoteTeamMemberGroup.invitations?.forEach((invitation) => {
        currAppState = mergeInvitation(currAppState, invitation);
        currAppState = mergeTeamMemberGroupInvitationRelation(
            currAppState,
            remoteTeamMemberGroup.id,
            invitation.id,
        );
    });

    currAppState.teamMemberGroups[remoteTeamMemberGroupId] =
        localNewTeamMemberGroup;
    return currAppState;
}

export function mergeTeamMemberGroupInvitationRelation(
    currAppState: AppState,
    remoteTeamMemberGroupId: string,
    remoteInvitationId: string,
): AppState {
    const teamMemberGroupId = toInt(remoteTeamMemberGroupId)!;
    const invitationId = toInt(remoteInvitationId)!;
    const hasTeamMemberGroupInvitationRelation =
        currAppState.teamMemberGroupInvitationRelations.some(
            (teamMemberGroupInvitationRelation) => {
                return (
                    teamMemberGroupInvitationRelation.groupId ===
                        teamMemberGroupId &&
                    teamMemberGroupInvitationRelation.invitationId ===
                        invitationId
                );
            },
        );

    if (!hasTeamMemberGroupInvitationRelation) {
        currAppState.teamMemberGroupInvitationRelations.push({
            groupId: teamMemberGroupId,
            invitationId: invitationId,
        });
    }

    return currAppState;
}

export function mergeTeamMemberGroupUserRelation(
    currAppState: AppState,
    remoteTeamMemberGroupId: string,
    remoteUserId: string,
): AppState {
    const teamMemberGroupId = toInt(remoteTeamMemberGroupId)!;
    const userId = toInt(remoteUserId)!;

    const hasTeamMemberGroupUserRelation =
        currAppState.teamMemberGroupUserRelations.some(
            (teamMemberGroupUserRelation) => {
                return (
                    teamMemberGroupUserRelation.groupId === teamMemberGroupId &&
                    teamMemberGroupUserRelation.memberUserId === userId
                );
            },
        );

    if (!hasTeamMemberGroupUserRelation) {
        currAppState.teamMemberGroupUserRelations.push({
            groupId: teamMemberGroupId,
            memberUserId: userId,
        });
    }

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
        activeSprintId:
            toInt(remoteTeam.activeSprint?.id) || localOldTeam.activeSprintId,
    };

    if (remoteTeam.creator) {
        currAppState = mergeUser(currAppState, remoteTeam.creator);
    }

    if (remoteTeam.members) {
        currAppState = removeOrMergeTeamMembers(
            currAppState,
            remoteTeamId,
            remoteTeam.members,
        );
    }
    remoteTeam.tasks?.forEach((task) => {
        currAppState = mergeTask(currAppState, task);
    });

    remoteTeam.managedApps?.forEach((app) => {
        currAppState = mergeApp(currAppState, app, remoteTeamId);
    });

    remoteTeam.appInstallations?.forEach((appInstallation) => {
        currAppState = mergeAppInstallation(currAppState, appInstallation);
    });

    remoteTeam.projects?.forEach((project) => {
        currAppState = mergeProject(currAppState, project);
    });

    remoteTeam.memberGroups?.forEach((group) => {
        currAppState = mergeTeamMemberGroup(currAppState, group);
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

    if (remoteTeam.activeSprint) {
        localNewTeam.activeSprintId = toInt(remoteTeam.activeSprint.id);
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

export function mergeTaskLink(
    currAppState: AppState,
    remoteTaskLink: RemoteTaskLink,
): AppState {
    const remoteTaskLinkId = toInt(remoteTaskLink.id)!;
    const remoteTaskId = toInt(remoteTaskLink.taskId)!;
    const localOldTaskLink = currAppState.taskLinks[remoteTaskLinkId] || {};
    const localNewTaskLink: TaskLinkState = {
        id: remoteTaskLinkId,
        taskId: remoteTaskId,
        title: remoteTaskLink.title || localOldTaskLink.title,
        previewTitle: remoteTaskLink.previewTitle || localOldTaskLink.title,
        url: remoteTaskLink.url || localOldTaskLink.url,
        iconUrl: remoteTaskLink.iconUrl || localOldTaskLink.iconUrl,
        iconHoverUrl:
            remoteTaskLink.iconHoverUrl || localOldTaskLink.iconHoverUrl,
    };

    currAppState.taskLinks[remoteTaskLinkId] = localNewTaskLink;
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

export function mergeTaskActivity(
    currAppState: AppState,
    teamId: number,
    remoteTaskActivity: RemoteTaskActivity,
): AppState {
    const taskId = Number(remoteTaskActivity.taskId);
    const index = currAppState.taskActivities.findIndex(
        (taskActivity) =>
            taskActivity.taskId === taskId && taskActivity.teamId === teamId,
    );

    const localOldTaskActivity =
        index !== -1 ? currAppState.taskActivities[index] : undefined;

    const remoteClient = remoteTaskActivity.dragTaskActivity.client;
    let clientId;
    if (remoteClient) {
        clientId = Number(remoteClient.id);
        currAppState = mergeClient(currAppState, remoteClient);
    } else {
        clientId = localOldTaskActivity?.dragTaskActivity.clientId;
    }

    const taskActivityState = new TaskActivityState(
        teamId,
        taskId,
        new DragTaskActivityState(
            remoteTaskActivity.dragTaskActivity.isDragging,
            clientId,
        ),
    );

    if (index !== -1) {
        currAppState.taskActivities[index] = taskActivityState;
    } else {
        currAppState.taskActivities.push(taskActivityState);
    }

    return currAppState;
}

export function removeOrMergeTeamMembers(
    currAppState: AppState,
    teamId: number,
    remoteTeamMembers: RemoteTeamMember[],
): AppState {
    const teamMemberStateMap: Record<string, TeamMemberState> =
        currAppState.teamMembers.reduce(
            (
                prevTeamMemberStateMap: Record<string, TeamMemberState>,
                teamMemberState,
            ) => {
                if (teamMemberState.teamId !== teamId) {
                    return prevTeamMemberStateMap;
                }

                const key = `${teamId}:${teamMemberState.userId}`;
                prevTeamMemberStateMap[key] = teamMemberState;
                return prevTeamMemberStateMap;
            },
            {},
        );
    const newTeamMemberStates = remoteTeamMembers.map((remoteTeamMember) => {
        const key = `${teamId}:${remoteTeamMember.user.id}`;
        const oldTeamMemberState = teamMemberStateMap[key];
        const bandwidth =
            remoteTeamMember.weeklyBandwidth === undefined
                ? oldTeamMemberState?.weeklyBandwidth
                : Duration.fromString(remoteTeamMember.weeklyBandwidth);
        const createdAt =
            remoteTeamMember.createdAt === undefined
                ? oldTeamMemberState?.createdAt
                : toDate(remoteTeamMember.createdAt)!;
        const updatedAt =
            remoteTeamMember.updatedAt === undefined
                ? oldTeamMemberState?.updatedAt
                : toDate(remoteTeamMember.updatedAt)!;
        return new TeamMemberState(
            teamId,
            Number(remoteTeamMember.user.id),
            bandwidth,
            createdAt,
            updatedAt,
        );
    });

    currAppState.teamMembers = currAppState.teamMembers
        .filter((teamMemberState) => {
            return teamMemberState.teamId !== teamId;
        })
        .concat(newTeamMemberStates);
    remoteTeamMembers.forEach((member) => {
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

export function replaceTeamTaskActivities(
    appState: AppState,
    teamId: number,
    remoteTaskActivities: RemoteTaskActivity[],
): AppState {
    appState.taskActivities = appState.taskActivities.filter(
        (taskActivity) => taskActivity.teamId !== teamId,
    );

    remoteTaskActivities.forEach(
        (remoteTaskActivity) =>
            (appState = mergeTaskActivity(
                appState,
                teamId,
                remoteTaskActivity,
            )),
    );

    return appState;
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

export function mergeSprintParticipant(
    appState: AppState,
    sprintId: number,
    remoteSprintParticipant: RemoteSprintParticipant,
): AppState {
    const sprintParticipantUserId = toInt(remoteSprintParticipant.user.id)!;
    const localOldSprintParticipantIndex =
        appState.sprintParticipants.findIndex((sprintParticipant) => {
            return (
                sprintParticipant.sprintId === sprintId &&
                sprintParticipant.userId === sprintParticipantUserId
            );
        });
    const localOldSprintParticipant: SprintParticipantState =
        localOldSprintParticipantIndex !== -1
            ? appState.sprintParticipants[localOldSprintParticipantIndex]
            : ({} as SprintParticipantState);

    const totalBandwidth =
        remoteSprintParticipant.totalBandwidth === undefined
            ? localOldSprintParticipant.totalBandwidth
            : toDuration(remoteSprintParticipant.totalBandwidth);
    const unusedBandwidth =
        remoteSprintParticipant.unusedBandwidth === undefined
            ? localOldSprintParticipant.unusedBandwidth
            : toDuration(remoteSprintParticipant.unusedBandwidth);
    const localNewSprintParticipant: SprintParticipantState = {
        sprintId,
        userId: sprintParticipantUserId,
        totalBandwidth: totalBandwidth!,
        unusedBandwidth: unusedBandwidth!,
        createdAt:
            remoteSprintParticipant.createdAt === undefined
                ? localOldSprintParticipant.createdAt
                : toDate(remoteSprintParticipant.createdAt)!,
        updatedAt:
            remoteSprintParticipant.updatedAt === undefined
                ? localOldSprintParticipant.updatedAt
                : toDate(remoteSprintParticipant.updatedAt),
    };

    if (localOldSprintParticipantIndex === -1) {
        appState.sprintParticipants = appState.sprintParticipants.concat(
            localNewSprintParticipant,
        );
    } else {
        appState.sprintParticipants[localOldSprintParticipantIndex] =
            localNewSprintParticipant;
    }

    appState = mergeUser(appState, remoteSprintParticipant.user);
    return appState;
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
