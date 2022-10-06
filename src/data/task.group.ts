import { groupBy } from '@lib/data/groupBy';

import { Task } from '@core/entity/task';

export function groupByOwners(tasks: Task[]): Map<number | undefined, Task[]> {
    return groupBy(tasks, (task: Task) => {
        return task.owner?.id;
    });
}

export function flattenGroupedTasksByOwner(groupedTasks: Map<number | undefined, Task[]>): Task[] {
    const allTasks =  Array.from(groupedTasks.entries())
    const unAssignedTasks  = allTasks.find(([key, _]) => key === undefined )?.[1] || []
    const assignedTasks = allTasks.filter(([key, _]) => key !== undefined).flatMap(([_, tasks]) => tasks)

    return assignedTasks.concat(unAssignedTasks)
}