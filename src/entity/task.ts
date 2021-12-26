import { TaskAction } from './taskAction';
import { User } from './user';

export interface Task {
    id: number;
    goal: string;
    dueAt?: number;
    context?: string;
    owner?: User;
    effort?: number;
    numOfUnknowns?: number;
    availableActions: TaskAction[];
}
