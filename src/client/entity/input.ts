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
    ownerUserId: string;
}

export interface CreateTaskInput {
    goal: string;
    context?: string;
    ownerUserId?: string;
    dueAt?: Date;
    isPlanned?: boolean;
}

export interface UpdateTaskInput {
    goal: string;
    context?: string;
    ownerUserId?: string;
    owningTeamId: string;
    effort?: string;
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
