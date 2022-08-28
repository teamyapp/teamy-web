import { Task } from '@core/entity/task';

export type SortOrder = (task1: Task, task2: Task) => number;
