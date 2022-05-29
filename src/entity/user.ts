import { Task } from './task';
import { Team } from './team';

export interface User {
    id: number;
    firstName?: string;
    lastName?: string;
    profileUrl?: string;
    activeTeam?: Team;
    teams?: Team[];
    upcomingTasks?: Task[];
    deliveredTasks?: Task[];
}
