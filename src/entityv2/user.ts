import { Team } from './team';

export interface User {
    id: number;
    firstName: string;
    lastName: String;
    profileUrl?: string;
    createdAt: Date
    teams: Team[]
}
