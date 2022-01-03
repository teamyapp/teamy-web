import { Task } from '@core/entity/task';
import { TeamStatus } from '@core/entity/teamStatus';

export interface IAppState {
    currentUserId: number;
    activeTeamId: number;
    needAttentionTask?: Task;
    teamStatus: TeamStatus;
}

export const initialState: IAppState = {
    currentUserId: -1,
    activeTeamId: -1,
    teamStatus: {
        upcomingTasks: [],
        inProgressTasks: [],
        deliveredTasks: [],
    },
};
