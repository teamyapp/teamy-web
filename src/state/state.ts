import { Task } from '@core/entity/task';
import { Team } from '@core/entity/team';
import { User } from '@core/entity/user';

export interface IAppState {
    currentUser: User;
    needAttentionTask?: Task;
    teams: Team[];
    teamTasks: Task[];
    activeTeamId: string;
}

export const initialState: IAppState = {
    currentUser: { id: -1 },
    teams: [],
    teamTasks: [],
    activeTeamId: '-1',
};

export interface StateMachine {
    state: string
    size: number
    
}

