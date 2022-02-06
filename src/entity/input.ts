import { TaskStatus } from './taskStatus';

export interface CreateTaskInput {
    goal: string;
    context?: string;
    dueAt?: string;
    ownerUserId?: string | number;
    status?: TaskStatus;
}

export interface CreateTeamInput {
    name: string;
}

export interface CreateInvitationInput {
    teamId: string;
    receiverFirstName: string;
    receiverLastName: string;
    expireAt: Date;
}
