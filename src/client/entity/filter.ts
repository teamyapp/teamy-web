import { TaskStatus } from '@core/entity/taskStatus';

export interface RemoteTaskFilter {
    goalContains?: string;
    isPlanned?: boolean;
    ownerId?: string;
    status?: TaskStatus;
    taskId?: string;
}
