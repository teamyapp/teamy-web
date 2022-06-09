export interface TeamState {
    id: number;
    name: string;
    iconUrl?: string;
    createdAt: Date;
    creatorUserId: number;
    ownerUserId: number;
    memberUserIds: number[];
    taskIds: number[];
    invitationIds: number[];
}

export function parseTeamState(teamStateJSON: any): TeamState {
    return {
        id: teamStateJSON.id,
        name: teamStateJSON.name,
        iconUrl: teamStateJSON.iconUrl,
        createdAt: new Date(teamStateJSON.createdAt),
        creatorUserId: teamStateJSON.creatorUserId,
        ownerUserId: teamStateJSON.ownerUserId,
        memberUserIds: teamStateJSON.memberUserIds,
        taskIds: teamStateJSON.taskIds,
        invitationIds: teamStateJSON.invitationIds,
    };
}
