import { groupBy } from '@lib/data/groupBy';

import { Task } from '@core/entity/task';

export function groupByOwners(tasks: Task[]): Map<number | undefined, Task[]> {
    return groupBy(tasks, (task: Task) => {
        return task.owner?.id;
    });
}

export function flattenGroupedTasksByOwner(
    groupedTasks: Map<number | undefined, Task[]>,
): Task[] {
    const unAssignedTasks = groupedTasks.get(undefined) || [];
    const assignedTasks = Array.from(groupedTasks.keys())
        .filter((userId) => userId !== undefined)
        .sort((userId1, userId2) => userId1! - userId2!)
        .flatMap((userId) => groupedTasks.get(userId)!);
    return assignedTasks.concat(unAssignedTasks);
}
