import { Event } from '@lib/event/event';

import { TaskCreationInput } from '@core/entity/input';
import { Task } from '@core/entity/task';

export type MutationEvent =
    | CreateTask
    | UpdateTask
    | DeleteTask
    | StartTask
    | CompleteTask
    | RemoveTaskOwner
    | UpdateActiveTeam;

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
    taskId: number | string;
}

export interface StartTask extends Event {
    type: 'StartTask';
    taskId: number | string;
}

export interface CompleteTask extends Event {
    type: 'CompleteTask';
    taskId: number | string;
}

export interface RemoveTaskOwner extends Event {
    type: 'RemoveTaskOwner';
    taskId: string;
}

export interface UpdateActiveTeam extends Event {
    type: 'UpdateActiveTeam';
    teamId: string;
}
