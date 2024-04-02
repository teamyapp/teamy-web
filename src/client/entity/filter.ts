import { TaskStatus } from '@core/entity/taskStatus';

export interface RemoteTaskFilter {
    goalContains?: string;
    isScheduled?: boolean;
    ownerId?: string;
    status?: TaskStatus;
    taskId?: string;
}
