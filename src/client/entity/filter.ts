import { TaskStatus } from '@core/entity/taskStatus';

export interface RemoteTaskFilter {
    goalContains?: string;
    isScheduled?: boolean;
    isPlanned?: boolean;
    ownerId?: string;
    status?: TaskStatus;
    taskId?: string;
}
