import { SortOrder } from '@lib/data/order';

import { Priority } from '@core/entity/priority';
import { Task } from '@core/entity/task';
import { TaskStatus } from '@core/entity/taskStatus';

const taskStatusProgressOrder: Record<TaskStatus, number> = {
    PAUSED: 1,
    TODO: 2,
    BLOCKED: 3,
    AWAITING: 4,
    IN_PROGRESS: 5,
    DELIVERED: 6,
};

const priorityOrder: Record<Priority, number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    URGENT: 4,
};

export const orderByPriorityDesc: SortOrder<Task> = (
    task1: Task,
    task2: Task,
): number => {
    if (!task1.priority && !task2.priority) {
        return 0;
    }

    if (!task1.priority) {
        return 1;
    }

    if (!task2.priority) {
        return -1;
    }

    return priorityOrder[task2.priority] - priorityOrder[task1.priority];
};

export const orderByUrgency: SortOrder<Task> = (
    task1: Task,
    task2: Task,
): number => {
    if (!task1.dueAt && !task2.dueAt) {
        return task1.id - task2.id;
    }

    if (!task1.dueAt) {
        return 1;
    }

    if (!task2.dueAt) {
        return -1;
    }

    const compare = task1.dueAt.getTime() - task2.dueAt.getTime();
    if (compare !== 0) {
        return compare;
    }

    return task1.id - task2.id;
};

export const orderByValue: SortOrder<Task> = (
    task1: Task,
    task2: Task,
): number => {
    // TODO: implement me
    return 0;
};

export const orderByEffort: SortOrder<Task> = (
    task1: Task,
    task2: Task,
): number => {
    // TODO: implement me
    return 0;
};

export const orderByStatusUrgencyAsc: SortOrder<Task> = (
    task1: Task,
    task2: Task,
): number => {
    const compare =
        taskStatusProgressOrder[task1.status] -
        taskStatusProgressOrder[task2.status];
    if (compare !== 0) {
        return compare;
    }

    return orderByUrgency(task1, task2);
};

export const orderById: SortOrder<Task> = (
    task1: Task,
    task2: Task,
): number => {
    return task1.id - task2.id;
};
