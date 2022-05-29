import { TaskAction } from '@core/statev2/taskAction';
import { TaskStatus } from '@core/statev2/taskStatus';

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
    availableActions: TaskAction[];
}
