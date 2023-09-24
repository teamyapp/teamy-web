import { Duration } from '@lib/entity/duration';

import { Priority } from '@core/entity/priority';

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

export interface CreateStaticActivatorInput {
    type: 'static';
}

export interface CreateTimeRangeActivatorInput {
    type: 'timeRange';
    startAt?: Date;
    endAt?: Date;
}

export interface CreateMaxViewersActivatorInput {
    type: 'maxViewers';
    maxViewers: number;
}

export interface CreatePercentageActivatorInput {
    type: 'percentage';
    percentage: number;
}

export type CreateVersionSelectorInput =
    | CreateStaticVersionSelectorInput
    | CreateExperimentVersionSelectorInput;

export interface CreateStaticVersionSelectorInput {
    type: 'static';
    versionNumber: number;
}

export interface CreateExperimentVersionSelectorInput {
    type: 'experiment';
    versionNumbers: number[];
}

export interface CreateAppRolloutInput {
    name: string;
    activator: CreateActivatorInput;
    versionSelector: CreateVersionSelectorInput;
    isEnabled: boolean;
    groupIds: number[];
}
