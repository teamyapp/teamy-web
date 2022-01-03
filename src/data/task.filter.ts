// Abstract:
// Project Progression Management, at the computation level, is a series of tranductions on a sequence of tasks.
//
// key words:
// Transducer https://clojure.org/reference/transducers
// Transduction is a generalization of reduction & other functional paradigm.
// In short, a transducer transforms(A->B) & reduces(many->one) data.
import { Filter, GroupBy } from '@lib/data/filter';

import { Task } from '@core/entity/task';
import { User } from '@core/entity/user';

export const Upcoming: Filter<Task> = (task: Task) =>
    task.status === 'Upcoming';
export const InProgress: Filter<Task> = (task: Task) =>
    task.status === 'InProgress';
export const Delivered: Filter<Task> = (task: Task) =>
    task.status === 'Delivered';

export function Between(begin: Date, end: Date): Filter<Task> {
    return (task: Task) => {
        return (
            task.dueAt !== undefined &&
            begin.getUTCMilliseconds() < Date.parse(task.dueAt) &&
            Date.parse(task.dueAt) < end.getUTCMilliseconds()
        );
    };
}

export function Contains(text: string): Filter<Task> {
    return (task: Task) =>
        task.goal.includes(text) ||
        (task.context !== undefined && task.context.includes(text));
}

// Given a sequence of tasks, split it to N sequences of tasks where N is the number of unique assignees.
// this is useful when the UI wants to group tasks by owners instead of status.
export function GroupByOwners(tasks: Task[]): Map<User | undefined, Task[]> {
    return GroupBy(tasks, (task) => {
        if (task.owner === null) {
            return undefined; // treat both null & undefined as undefined
        } else {
            return task.owner;
        }
    });
}
