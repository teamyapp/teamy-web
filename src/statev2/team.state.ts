export interface TeamState {
    id: number;
    name: string;
    iconUrl?: string;
    createdAt: Date;
    creatorUserId: number;
    memberUserIds: number[];
    taskIds: number[];
    invitationIds: number[];
}
