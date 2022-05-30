import { Task } from '@core/entity/task';
import { Team } from '@core/entity/team';
import { User } from '@core/entity/user';

export interface IAppState {
    currentUser?: User;
    needAttentionTask?: Task;
    teams: Team[];
    teamTasks: Task[];
    activeTeamId?: number;
}

export const initialState: IAppState = {
    teams: [],
    teamTasks: [],
};
