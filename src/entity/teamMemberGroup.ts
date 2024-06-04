import { Invitation } from './invitation';
import { Team } from './team';
import { User } from './user';

export interface TeamMemberGroup {
    id: number;
    name: string;
    orderIndex: number;
    team: Team;
    members: User[];
    createdAt: Date;
    updatedAt?: Date;
    invitations: Invitation[];
}
