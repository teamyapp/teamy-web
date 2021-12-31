import { Task } from '@core/entity/task';
import { TeamStatus } from '@core/entity/teamStatus';

export interface IAppState {
    currentUserId: number;
    needAttentionTask?: Task;
    teamStatus: TeamStatus;
}

export const initialState = {
    currentUserId: -1,
    teamStatus: {
        upcomingTasks: [],
        inProgressTasks: [],
        deliveredTasks: [],
    },
};
