import { PersonalStatus } from '@entity/personalStatus';
import { Task } from '@entity/task';
import { Team } from '@entity/team';

export interface Event {
    type: any;
}

export type MutationEvent =
    | CreateTaskEvent
    | UpdateTaskEvent
    | DeleteTaskEvent
    | StartTaskEvent
    | CompleteTaskEvent
    | RefreshTeamEvent;

export interface CreateTaskEvent extends Event {
    type: 'CreateTask';
    task: Task;
}

export interface UpdateTaskEvent extends Event {
    type: 'UpdateTask';
    task: Task;
}

export interface DeleteTaskEvent extends Event {
    type: 'DeleteTask';
    taskId: number;
}

export interface StartTaskEvent extends Event {
    type: 'StartTask';
    taskId: number;
}

export interface CompleteTaskEvent extends Event {
    type: 'CompleteTask';
    taskId: number;
}

export interface RefreshTeamEvent extends Event {
    type: 'RefreshTeam';
    currentUserId: number;
    tasksNeedAttention: Task[];
    upcomingTasks: Task[];
    inProgressTasks: Task[];
    deliveredTasks: Task[];
}
