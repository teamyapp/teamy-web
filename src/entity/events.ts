import { Event } from '@lib/event/event';

import { Task } from '@core/entity/task';

import { TaskStatus } from './taskStatus';

export type MutationEvent =
    | CreateTask
    | UpdateTask
    | DeleteTask
    | StartTask
    | CompleteTask
    | UpdateActiveTeam;

export interface TaskCreationInput {
    goal: string;
    context?: string;
    createdAt: Date;
    dueAt?: Date;
    ownerUserId?: string | number;
    status?: TaskStatus;
}

export interface CreateTask extends Event {
    type: 'CreateTask';
    task: TaskCreationInput;
    teamId: string;
}

export interface TaskUpdateInput {
    id: string | number;
    goal: string;
    context?: string;
    dueAt?: Date;
    ownerUserId?: string | number;
    status?: TaskStatus;
}

export interface UpdateTask extends Event {
    type: 'UpdateTask';
    task: TaskUpdateInput;
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

export interface UpdateActiveTeam extends Event {
    type: 'UpdateActiveTeam';
    teamId: string;
}
