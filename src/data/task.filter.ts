// Abstract:
// Project Progression Management, at the computation level, is a series of tranductions on a sequence of tasks.
//
// key words:
// Transducer https://clojure.org/reference/transducers
// Transduction is a generalization of reduction & other functional paradigm.
// In short, a transducer transforms(A->B) & reduces(many->one) data.
import { Filter } from '@lib/data/filter';

import { Task } from '@core/entity/task';

export const allTasks: Filter<Task> = (task: Task): boolean => true;

export const todo: Filter<Task> = (task: Task): boolean =>
    task.status === 'TODO';
export const paused: Filter<Task> = (task: Task): boolean =>
    task.status === 'PAUSED';
export const inProgress: Filter<Task> = (task: Task): boolean =>
    task.status === 'IN_PROGRESS';
export const delivered: Filter<Task> = (task: Task): boolean =>
    task.status === 'DELIVERED';
export const unfinished: Filter<Task> = (task: Task): boolean =>
    task.status !== 'DELIVERED';
export const awaiting: Filter<Task> = (task: Task): boolean =>
    task.status === 'AWAITING';

export function ownedBy(ownerUserId: number): Filter<Task> {
    return (task: Task) => task.owner?.id === ownerUserId;
}

export const unplanned: Filter<Task> = (task: Task): boolean => !task.isPlanned;

export function between(
    begin: Date | null,
    end: Date | null,
    selectDate: (task: Task) => Date | undefined,
): Filter<Task> {
    return (task: Task) => {
        if (!begin && !end) {
            return true;
        }

        const date = selectDate(task);
        if (!date) {
            return false;
        }
        if (!begin) {
            return date.getTime() <= end!.getTime();
        } else if (!end) {
            return begin.getTime() <= date.getTime();
        } else {
            return (
                begin.getTime() <= date.getTime() &&
                date.getTime() <= end.getTime()
            );
        }
    };
}

export function contains(keyword: string): Filter<Task> {
    const lowerKeyword = keyword.toLocaleLowerCase();
    return (task: Task) =>
        task.goal.toLocaleLowerCase().includes(lowerKeyword) ||
        task.context?.toLocaleLowerCase().includes(lowerKeyword) ||
        String(task.id).includes(lowerKeyword) ||
        false;
}
