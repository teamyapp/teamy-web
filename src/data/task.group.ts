import { groupBy } from '@lib/data/groupBy';

import { Task } from '@core/entity/task';

export function groupByOwners(tasks: Task[]): Map<number | undefined, Task[]> {
    const unAssignedTasks = tasks.filter(task => !task.owner)
    const assignedTasks = tasks.filter(task => !!task.owner)
    const groupedTasks = groupBy(assignedTasks, (task: Task) => {
        return task.owner?.id;
    });

    groupedTasks.set(-1, unAssignedTasks)
    return groupedTasks
}
