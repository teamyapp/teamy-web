import Team from './Team';

export interface User {
    id: number;
    firstName?: string;
    lastName?: string;
    profileUrl?: string;
    activeTeam?: Team;
}
