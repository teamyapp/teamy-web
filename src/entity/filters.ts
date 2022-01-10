import { Filter } from '@lib/data/filter';

import { Task } from '@core/entity/task';

export interface TaskFilters {
    timeRangeFilter?: Filter<Task>;
    taskOwnerFilter?: Filter<Task>;
    keywordFilter?: Filter<Task>;
}
