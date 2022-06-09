export interface UserState {
    id: number;
    firstName: string;
    lastName: string;
    profileUrl?: string;
    createdAt: Date;
    teamIds: number[];
}

export function parseUserState(userStateJSON: any): UserState {
    return {
        id: userStateJSON.id,
        firstName: userStateJSON.firstName,
        lastName: userStateJSON.lastName,
        profileUrl: userStateJSON.profileUrl,
        createdAt: new Date(userStateJSON.createdAt),
        teamIds: userStateJSON.teamIds,
    };
}
