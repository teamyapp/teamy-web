import { TaskAction } from '@core/state/taskAction';
import { TaskStatus } from '@core/state/taskStatus';

export interface TaskState {
    id: number;
    goal: string;
    context?: string;
    creatorUserId: number;
    ownerUserId?: number;
    owningTeamId: number;
    status: TaskStatus;
    commentsThreadId: number;
    createdAt: Date;
    updatedAt?: Date;
    dueAt?: Date;
    effort?: number;
    availableActions: TaskAction[];
}

export function parseTaskState(taskStateJSON: any): TaskState {
    return {
        id: taskStateJSON.id,
        goal: taskStateJSON.goal,
        context: taskStateJSON.context,
        creatorUserId: taskStateJSON.creatorUserId,
        ownerUserId: taskStateJSON.ownerUserId,
        owningTeamId: taskStateJSON.owningTeamId,
        status: taskStateJSON.status,
        commentsThreadId: taskStateJSON.commentsThreadId,
        createdAt: new Date(taskStateJSON.createdAt),
        updatedAt: taskStateJSON.updatedAt
            ? new Date(taskStateJSON.updatedAt)
            : taskStateJSON.updatedAt,
        dueAt: taskStateJSON.dueAt
            ? new Date(taskStateJSON.dueAt)
            : taskStateJSON.dueAt,
        effort: taskStateJSON.effort,
        availableActions: taskStateJSON.availableActions,
    };
}
