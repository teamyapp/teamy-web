// Abstract:
// Project Progression Management, at the computation level, is a series of tranductions on a sequence of tasks.
//
// key words:
// Transducer https://clojure.org/reference/transducers
// Transduction is a generalization of reduction & other functional paradigm.
// In short, a transducer transforms(A->B) & reduces(many->one) data.

import { Task } from '@core/entity/task';
import { User } from '@core/entity/user';

// This is not a generic implementation of Transducer,
// but a business aware implementation.

// Because JS does not have a good generalization of functor APIs for Iterabls,
// Use Array here.
// Meaning this is a synchronize implementation only.
// When async or infinite API is needed, implementation will change.
type Filterer<T> = (data: T) => boolean;

// Or reduces a sequence of fitlerers to one filterers with Or/Union semantics.
export function Or<T>(...filterers: Filterer<T>[]): Filterer<T> {
    return (data: T) => {
        for (let f of filterers) {
            if (f(data)) {
                return true;
            }
        }
        return false;
    };
}

// And reduces a sequence of fitlerers to one filterers with And/Intersection semantics.
export function And<T>(...filterers: Filterer<T>[]): Filterer<T> {
    return (data: T) => {
        for (let f of filterers) {
            if (!f(data)) {
                return false;
            }
        }
        return true;
    };
}

export const Upcoming: Filterer<Task> = (task: Task) =>
    task.status === 'Upcoming';
export const InProgress: Filterer<Task> = (task: Task) =>
    task.status === 'InProgress';
export const Delivered: Filterer<Task> = (task: Task) =>
    task.status === 'Delivered';
export function Between(begin: Date, end: Date): Filterer<Task> {
    return (task: Task) => {
        return (
            task.dueAt !== undefined &&
            begin.getUTCMilliseconds() < Date.parse(task.dueAt) &&
            Date.parse(task.dueAt) < end.getUTCMilliseconds()
        );
    };
}
export function Contains(text: string): Filterer<Task> {
    return (task: Task) =>
        task.goal.includes(text) ||
        (task.context !== undefined && task.context.includes(text));
}

// Given a sequence of tasks, split it to N sequences of tasks where N is the number of unique assignees.
// this is useful when the UI wants to group tasks by owners instead of status.
export function GroupByOwners(tasks: Task[]): Map<User | undefined, Task[]> {
    return GroupBy(tasks, (task) => task.owner);
}

// Generic GroupBy
export function GroupBy<T, Group>(
    data: T[],
    groupBy: (ele: T) => Group,
): Map<Group | undefined, T[]> {
    return data.reduce((accu, cur) => {
        if (accu.has(groupBy(cur))) {
            accu.get(groupBy(cur))?.push(cur);
        } else {
            accu.set(groupBy(cur), [cur]);
        }
        return accu;
    }, new Map<Group | undefined, T[]>());
}
