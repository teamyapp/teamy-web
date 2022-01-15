import { TaskAction } from './taskAction';
import { TaskStatus } from './taskStatus';
import { User } from './user';

export interface Task {
    id: number | string;
    goal: string;
    createdAt?: Date;
    dueAt?: Date;
    context?: string;
    owner?: User;
    availableActions: TaskAction[];
    status: TaskStatus;
}
