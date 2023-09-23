export interface RemoteUpdateTaskInput {
    goal: string;
    context?: string;
    ownerUserId?: string;
    owningTeamId: string;
    effort?: string;
    priority?: string;
    dueAt?: Date;
}
