import { Duration } from '@core/entity/duration';

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
