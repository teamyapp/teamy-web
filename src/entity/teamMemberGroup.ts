import { Team } from './team';
import { User } from './user';

export interface TeamMemberGroup {
    id: number;
    name: string;
    team: Team;
    members: User[];
    createdAt: Date;
    updatedAt?: Date;
}
