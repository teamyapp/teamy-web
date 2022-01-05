import { Event } from '@lib/event/event';

import { Task } from '@core/entity/task';
import { TaskStatus } from './taskStatus';

export type MutationEvent =
    | CreateTask
    | UpdateTask
    | DeleteTask
    | StartTask
    | CompleteTask
// | RefreshTeam;

export interface TaskCreationInput {
    goal: string
    context?: string
    dueAt?: string
    ownerUserId?: string | number
    status?: TaskStatus
}

export interface CreateTask extends Event {
    type: 'CreateTask';
    task: TaskCreationInput;
    teamId: string;
}

export interface UpdateTask extends Event {
    type: 'UpdateTask';
    task: Task;
}

export interface DeleteTask extends Event {
    type: 'DeleteTask';
    taskId: number| string;
}

export interface StartTask extends Event {
    type: 'StartTask';
    taskId: number| string;
}

export interface CompleteTask extends Event {
    type: 'CompleteTask';
    taskId: number| string;
}

// export interface RefreshTeam extends Event {
//     type: 'RefreshTeam';
//     currentUserId: number;
//     tasksNeedAttention: Task[];
//     teamTasks: Task[];
// }
