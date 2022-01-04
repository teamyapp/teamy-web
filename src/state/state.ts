import { Task } from '@core/entity/task';

export interface IAppState {
    currentUserId: number;
    needAttentionTask?: Task;
    teamTasks: Task[];
}

export const initialState = {
    currentUserId: -1,
    teamTasks: [],
};
