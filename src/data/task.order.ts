import { Task } from '@core/entity/task';

export const orderByPriority = (tasks: Task[]): Task[] => {
    // TODO: implement me
    return tasks;
};
export const orderByUrgency = (tasks: Task[]): Task[] => {
    return tasks.sort((task1: Task, task2: Task): number => {
        if (!task1.dueAt && !task2.dueAt) {
            return 0;
        } else if (!task1.dueAt) {
            return 1;
        } else if (!task2.dueAt) {
            return -1;
        } else {
            return (
                new Date(task1.dueAt).getTime() -
                new Date(task2.dueAt).getTime()
            );
        }
    });
};
export const orderByValue = (tasks: Task[]): Task[] => {
    // TODO: implement me
    return tasks;
};
export const orderByEffort = (tasks: Task[]): Task[] => {
    // TODO: implement me
    return tasks;
};
