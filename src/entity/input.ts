import { Duration } from '@lib/entity/duration';

import { Priority } from '@core/entity/priority';

import { GroupMemberType, GroupType } from './group';
import { AppRolloutType } from './rollout';
import { AppVersionStatus } from './appVersion';

export interface CreateAppInput {
    name: string;
}

export interface CreateStaticGroupInput {
    groupName: string;
    memberIds: number[];
    rolloutIds: number[];
}

export interface CreateFilterGroupInput {
    groupName: string;
    filter: string;
    groupMemberType: GroupMemberType;
    rolloutIds: number[];
}

export interface UpdateGroupInput {
    name: string;
    type: GroupType;
    groupMemberType: GroupMemberType;
    rolloutIds: number[];
    memberIds?: number[];
    filter?: string;
}

export interface CreateUserInput {
    lastName: string;
    firstName: string;
    profileUrl?: string;
}

export interface UpdateUserInput {
    lastName: string;
    firstName: string;
    profileUrl?: string;
}

export interface CreateTeamInput {
    name: string;
}

export interface UpdateTeamInput {
    name: string;
    iconUrl?: string;
    ownerUserId: number;
}

export interface CreateTaskInput {
    goal: string;
    context?: string;
    ownerUserId?: number;
    dueAt?: Date;
}

export interface UpdateTaskInput {
    goal: string;
    context?: string;
    ownerUserId?: number;
    owningTeamId: number;
    effort?: Duration;
    priority?: Priority;
    dueAt?: Date;
}

export interface CreateMessageInput {
    body: string;
}

export interface UpdateMessageInput {
    body: string;
}

export interface UpdateAppSecretInput {
    name: string;
}

export interface CreateInvitationInput {
    receiverFirstName?: string;
    receiverLastName?: string;
    expireAt: Date;
}

export interface UpdateInvitationInput {
    receiverFirstName?: string;
    receiverLastName?: string;
    expireAt: Date;
}

export interface CreateSprintInput {
    startAt: Date;
    endAt: Date;
}

export interface UpdateTeamMemberInput {
    userId: number;
    weeklyBandwidth: Duration;
}

export type CreateActivatorInput =
    | CreateStaticActivatorInput
    | CreateTimeRangeActivatorInput
    | CreateMaxViewersActivatorInput
    | CreatePercentageActivatorInput;

export type ActivatorType =
    | 'STATIC'
    | 'TIME_RANGE'
    | 'MAX_VIEWERS'
    | 'PERCENTAGE';

export interface CreateStaticActivatorInput {
    type: 'STATIC';
}

export interface CreateTimeRangeActivatorInput {
    type: 'TIME_RANGE';
    startAt?: Date;
    endAt?: Date;
}

export interface CreateMaxViewersActivatorInput {
    type: 'MAX_VIEWERS';
    maxViewers: number;
}

export interface CreatePercentageActivatorInput {
    type: 'PERCENTAGE';
    percentage: number;
}

export interface UpdateActivatorInput {
    type: ActivatorType;
    startAt?: Date;
    endAt?: Date;
    maxViewers?: number;
    percentage?: number;
}

export type CreateVersionSelectorInput =
    | CreateStaticVersionSelectorInput
    | CreateExperimentVersionSelectorInput;

export type VersionSelectorType = 'STATIC' | 'EXPERIMENT';
export interface CreateStaticVersionSelectorInput {
    type: 'STATIC';
    versionNumber: number;
}

export interface CreateExperimentVersionSelectorInput {
    type: 'EXPERIMENT';
    versionNumbers: number[];
}

export interface UpdateVersionSelectorInput {
    type: VersionSelectorType;
    versionNumber?: number;
    versionNumbers?: number[];
}

export interface CreateAppRolloutInput {
    name: string;
    type: AppRolloutType;
    isEnabled: boolean;
    activatorId: number;
    versionSelectorId: number;
    groupIds: number[];
}

export interface UpdateRolloutInput {
    id: number;
    name: string;
    type: AppRolloutType;
    activatorId: number;
    versionSelectorId: number;
    isEnabled: boolean;
    groupIds: number[];
}

export interface CreateAppSecretInput {
    name: string;
}

export interface CreateAppVersionInput {
    appName: string;
    description: string;
}


export interface UpdateAppVersionInput {
    status: AppVersionStatus;
}