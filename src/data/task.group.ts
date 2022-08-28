import { groupBy } from '@lib/data/groupBy';

import { Task } from '@core/entity/task';

export function groupByOwners(tasks: Task[]): Map<number | undefined, Task[]> {
    return groupBy(tasks, (task: Task) => {
        return task.owner?.id;
    });
}
