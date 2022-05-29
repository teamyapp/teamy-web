import { Event } from '@lib/event/event';

import { CreateTaskInput, CreateTeamInput } from '@core/entity/input';
import { Task } from '@core/entity/task';

export type MutationEvent =
    | CreateTask
    | UpdateTask
    | DeleteTask
    | StartTask
    | CompleteTask
    | RemoveTaskOwner
    | UpdateActiveTeam
    | CreateTeam;

export interface CreateTask extends Event {
    type: 'CreateTask';
    task: CreateTaskInput;
    teamId: number;
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

export interface RemoveTaskOwner extends Event {
    type: 'RemoveTaskOwner';
    taskId: number;
}

export interface UpdateActiveTeam extends Event {
    type: 'UpdateActiveTeam';
    teamId: number;
}

export interface CreateTeam extends Event {
    type: 'CreateTeam';
    team: CreateTeamInput;
}
