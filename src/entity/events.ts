export type MutationEvent = TaskUpdate | TaskDelete | StartTask | CompleteTask;

export interface TaskUpdate {
    type: 'TaskUpdate';
    taskId: number;
    goal: string;
    context: string;
}

export interface TaskDelete {
    type: 'TaskDelete';
    taskId: number;
}

export interface StartTask {
    type: 'StartTask';
    taskId: number;
}

export interface CompleteTask {
    type: 'CompleteTask';
    taskId: number;
}
