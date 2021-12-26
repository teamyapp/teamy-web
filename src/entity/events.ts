export type MutationEvent = TaskUpdate | TaskDelete | StartTask;

export interface TaskUpdate {
    type: 'TaskUpdate';
    id: number;
    goal: string;
    context: string;
}

export interface TaskDelete {
    type: 'TaskDelete';
    id: number;
}

export interface StartTask {
    type: 'StartTask';
    id: number;
}
