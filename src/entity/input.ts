import { TaskStatus } from './taskStatus';

export interface CreateTaskInput {
    goal: string;
    context?: string;
    dueAt?: string;
    ownerUserId?: number;
    status?: TaskStatus;
}

export interface CreateTeamInput {
    name: string;
}

export interface CreateInvitationInput {
    teamId: number;
    receiverFirstName: string;
    receiverLastName: string;
    expireAt: Date;
}

export interface CreateUserInput {
    lastName: string;
    firstName: string;
    profileUrl?: string;
}
