// Abstract:
// Project Progression Management, at the computation level, is a series of tranductions on a sequence of tasks.
//
// key words:
// Transducer https://clojure.org/reference/transducers
// Transduction is a generalization of reduction & other functional paradigm.
// In short, a transducer transforms(A->B) & reduces(many->one) data.
import { Filter, groupBy } from '@lib/data/filter';

import { Task } from '@core/entity/task';
import { User } from '@core/entity/user';

export const allTasks: Filter<Task> = (task: Task) => true;

export const upcoming: Filter<Task> = (task: Task) =>
    task.status === 'UPCOMING';
export const inProgress: Filter<Task> = (task: Task) =>
    task.status === 'IN_PROGRESS';
export const delivered: Filter<Task> = (task: Task) =>
    task.status === 'DELIVERED';

export function ownedBy(ownerUserId: string): Filter<Task> {
    return (task: Task) => task.owner?.id === ownerUserId;
}

export function between(
    begin: Date | null,
    end: Date | null,
    selectDate: (task: Task) => string | undefined,
): Filter<Task> {
    return (task: Task) => {
        if (!begin && !end) {
            return true;
        }

        const dateString = selectDate(task);
        if (!dateString) {
            return false;
        }
        const date = Date.parse(dateString);

        if (!begin) {
            return date <= end!.getUTCMilliseconds();
        } else if (!end) {
            return begin.getUTCMilliseconds() <= date;
        } else {
            return (
                begin.getUTCMilliseconds() <= date &&
                date <= end.getUTCMilliseconds()
            );
        }
    };
}

export function contains(keyword: string): Filter<Task> {
    const lowerKeyword = keyword.toLocaleLowerCase();
    return (task: Task) =>
        task.goal.toLocaleLowerCase().includes(lowerKeyword) ||
        (task.context !== undefined &&
            task.context.toLocaleLowerCase().includes(lowerKeyword));
}

// Given a sequence of tasks, split it to N sequences of tasks where N is the number of unique assignees.
// this is useful when the UI wants to group tasks by owners instead of status.
export function groupByOwners(tasks: Task[]): Map<User | undefined, Task[]> {
    return groupBy(tasks, (task: Task) => {
        if (task.owner === null) {
            return undefined; // treat both null & undefined as undefined
        } else {
            return task.owner;
        }
    });
}
