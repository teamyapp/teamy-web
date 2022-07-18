import { Filter } from '@lib/data/filter';

import { Task } from '@core/entity/task';
import { TaskStatus } from '@core/entity/taskStatus';

export interface TaskFiltersData {
    startDate?: Date;
    endDate?: Date;
    selectedTaskOwners: Set<string>;
}

export interface TaskFilters {
    timeRangeFilter?: Filter<Task>;
    taskOwnerFilter?: Filter<Task>;
    keywordFilter?: Filter<Task>;
}

export interface TaskFilter {
    goalContains?: string;
    isPlanned?: boolean;
    ownerId?: number;
    status?: TaskStatus;
    taskId?: number;
}
