import { Event } from '@lib/event/event';

import { Task } from '@core/entity/task';

export type MutationEvent =
    | CreateTask
    | UpdateTask
    | DeleteTask
    | StartTask
    | CompleteTask
    // | RefreshTeam;

export interface CreateTask extends Event {
    type: 'CreateTask';
    task: Task;
    teamId: string;
}

export interface UpdateTask extends Event {
    type: 'UpdateTask';
    task: Task;
}

export interface DeleteTask extends Event {
    type: 'DeleteTask';
    taskId: number;
}

export interface StartTask extends Event {
    type: 'StartTask';
    taskId: number;
}

export interface CompleteTask extends Event {
    type: 'CompleteTask';
    taskId: number;
}

// export interface RefreshTeam extends Event {
//     type: 'RefreshTeam';
//     currentUserId: number;
//     tasksNeedAttention: Task[];
//     teamTasks: Task[];
// }
