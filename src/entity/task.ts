import { TaskAction } from './taskAction';
import { TaskStatus } from './taskStatus';
import { User } from './user';

export interface Task {
    id: string;
    goal: string;
    dueAt?: string; // RFC3339 string, todo: create a RFC3339 type
    context?: string;
    owner?: User;
    availableActions: TaskAction[];
    status: TaskStatus;
}
