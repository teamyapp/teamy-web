import { Priority } from '@core/entity/priority';

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
