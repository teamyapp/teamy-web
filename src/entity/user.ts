import { Team } from './team';

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    profileUrl?: string;
    teams: Team[];
}
