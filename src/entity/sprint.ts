import { Task } from '@core/entity/task';
import { Team } from '@core/entity/team';

export interface Sprint {
    id: number;
    startAt: Date;
    endAt: Date;
    createdAt: Date;
    owningTeam: Team;
    tasks: Task[];
    isCurrent: boolean;
}
