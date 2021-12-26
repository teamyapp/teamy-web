import { TaskAction } from './taskAction';
import { User } from './user';

export default interface Task {
    id: number;
    goal: string;
    dueAt?: number;
    context?: string;
    owner?: User;
    effort?: number;
    numOfUnknowns?: number;
    availableActions: TaskAction[];
}
