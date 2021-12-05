import Task from './Task';
import Team from './Team';

export interface User {
    id: number;
    firstName?: string;
    lastName?: string;
    profileUrl?: string;
    activeTeam?: Team;
    teams: Team[];
    upcomingTasks?: Task[];
    deliveredTasks?: Task[];
}
