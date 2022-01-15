import { TaskFilters } from '@core/entity/filters';
import { Task } from '@core/entity/task';
import { Team } from '@core/entity/team';
import { User } from '@core/entity/user';

export interface IAppState {
    currentUser: User;
    teams: Team[];
    teamTasks: Task[];
    activeTeamId: string;
    taskFilters: TaskFilters;
}

// needAttention Task is computed from data
export function needAttentionTask(state: IAppState): Task | undefined {
    let tasks = state.teamTasks.filter((t) => (t.status === "NEED_ATTENTION" && t.owner?.id === state.currentUser.id))
    if(tasks.length === 0) {
        return undefined
    } else if(tasks.length === 1) {
        return tasks[0]
    } else {
        console.error("more than 1 needAttentionTask for this user", tasks)
        return undefined
    }
}

export const initialState: IAppState = {
    currentUser: { id: '-1' },
    teams: [],
    teamTasks: [],
    activeTeamId: '-1',
    taskFilters: {},
};
