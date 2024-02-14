import { Priority } from '@core/entity/priority';

import { RemoteGroupMemberType } from './remoteGroupMemberType';
import { RemoteGroupType } from './remoteGroupType';
import { RemoteRolloutActivatorType } from './remoteRolloutActivatorType';
import { RemoteRolloutVersionSelectorType } from './remoteRolloutVersionSelectorType';

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


export interface RemoteCreateAppInput{
    name: string;
}
export interface RemoteCreateAppSecretInput {
    name: string;
}

export interface RemoteCreateAppVersionInput {
    appName: string;
    description: string;
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
