import { Task } from '@core/entity/task';

export interface IAppState {
    currentUserId: number;
    needAttentionTask?: Task;
    teamTasks: Task[];
    activeTeamId: string;
}

export const initialState: IAppState = {
    currentUserId: -1,
    teamTasks: [],
    activeTeamId: '-1',
};
