import { Priority } from '@core/entity/priority';

import { RemoteAppVersionStatus } from './remoteAppVersion';
import { RemoteGroupMemberType } from './remoteGroupMemberType';
import { RemoteGroupType } from './remoteGroupType';
import { RemoteRolloutActivatorType } from './remoteRolloutActivatorType';
import { RemoteRolloutVersionSelectorType } from './remoteRolloutVersionSelectorType';
import { RemotePhaseStatus } from './remotePhase';
import { RemoteStoryStatus } from './remoteStory';

export interface RemoteAppFilter {
    tagValues: string[];
}

export interface RemoteCreateUserInput {
    lastName: string;
    firstName: string;
    profileUrl?: string;
}

export interface RemoteUpdateUserInput {
    lastName: string;
    firstName: string;
    profileUrl?: string;
}

export interface RemoteCreateTeamInput {
    name: string;
}

export interface RemoteUpdateTeamInput {
    name: string;
    iconUrl?: string;
    ownerUserId: string;
}

export interface RemoteUpdateTeamMemberInput {
    userId: string;
    weeklyBandwidth: string;
}

export interface RemoteCreateTaskInput {
    goal: string;
    context?: string;
    ownerUserId?: string;
    dueAt?: Date;
    isPlanned: boolean;
}

export interface RemoteUpdateTaskInput {
    goal: string;
    context?: string;
    ownerUserId?: string;
    owningTeamId: string;
    effort?: string;
    priority?: Priority;
    dueAt?: Date;
}

export interface RemoteCreateMessageInput {
    body: string;
}

export interface RemoteUpdateMessageInput {
    body: string;
}

export interface RemoteCreateInvitationInput {
    receiverFirstName?: string;
    receiverLastName?: string;
    expireAt: Date;
}

export interface RemoteUpdateInvitationInput {
    receiverFirstName?: string;
    receiverLastName?: string;
    expireAt: Date;
}

export interface RemoteCreateSprintInput {
    startAt: Date;
    endAt: Date;
}

export interface RemoteCreateAppInput {
    name: string;
}

export interface RemoteCreateAppSecretInput {
    name: string;
}

export interface RemoteUpdateAppSecretInput {
    name: string;
}

export interface RemoteUpdateAppVersionInput {
    status: RemoteAppVersionStatus;
}

export interface RemoteCreateStaticUserGroupInput {
    name: string;
    userIds: string[];
    rolloutIds: string[];
}

export interface RemoteCreateStaticTeamGroupInput {
    name: string;
    teamIds: string[];
    rolloutIds: string[];
}

export interface RemoteUpdateGroupInput {
    name: string;
    type: RemoteGroupType;
    groupMemberType: RemoteGroupMemberType;
    rolloutIds: string[];
    filter?: string;
    memberIds: string[];
}

export interface RemoteUpdateActivatorInput {
    type: RemoteRolloutActivatorType;
    startAt?: Date;
    endAt?: Date;
    maxViewers?: number;
    percentage?: number;
}

export interface RemoteCreateFilterGroupInput {
    name: string;
    filter: string;
    groupMemberType: RemoteGroupMemberType;
    rolloutIds: string[];
}

export interface RemoteCreateTimeRangeActivatorInput {
    startAt?: Date;
    endAt?: Date;
}

export interface RemoteCreateMaxViewersActivatorInput {
    maxViewers: number;
}

export interface RemoteCreatePercentageActivatorInput {
    percentage: number;
}

export interface RemoteCreateStaticVersionSelectorInput {
    versionNumber: number;
}

export interface RemoteCreateExperimentVersionSelectorInput {
    versionNumbers: number[];
}

export interface RemoteUpdateActivatorInput {
    type: RemoteRolloutActivatorType;
    startAt?: Date;
    endAt?: Date;
    maxViewers?: number;
    percentage?: number;
}

export interface RemoteUpdateVersionSelectorInput {
    type: RemoteRolloutVersionSelectorType;
    versionNumber?: number;
    versionNumbers: number[];
}

export interface RemoteCreateRolloutInput {
    name: string;
    activatorId: string;
    versionSelectorId: string;
    isEnabled: boolean;
    groupIds: string[];
}

export interface RemoteUpdateRolloutInput {
    name: string;
    activatorId: string;
    versionSelectorId: string;
    isEnabled: boolean;
    groupIds: string[];
}

export interface RemoteCreateProjectInput {
    name: string;
    expectedStartAt: Date;
    expectedEndAt: Date;
}

export interface RemoteUpdateProjectInput {
    name: string;
    expectedStartAt: Date;
    expectedEndAt: Date;
}

export interface RemoteCreatePhaseInput {
    name: string;
    expectedStartAt: Date;
    expectedEndAt: Date;
}

export interface RemoteUpdatePhaseInput {
    name: string;
    expectedStartAt: Date;
    expectedEndAt: Date;
    status: RemotePhaseStatus;
}


export interface RemoteCreateStoryInput {
    name: string;
    ownerId?: string;
    priority?: Priority;
}

export interface RemoteUpdateStoryInput {
    name: string;
    status: RemoteStoryStatus;
    ownerId?: string;
    priority?: Priority;
}