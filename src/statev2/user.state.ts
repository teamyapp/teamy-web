export interface UserState {
    id: number;
    firstName: string;
    lastName: string;
    profileUrl?: string;
    createdAt: Date;
    teamIds: number[];
}
