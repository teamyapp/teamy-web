import { Task } from '@entity/task';
import { TeamStatus } from '@entity/teamStatus';

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
