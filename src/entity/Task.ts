import { TaskAction } from './TaskAction';
import { User } from './User';

export default interface Task {
    id: number;
    goal: string;
    dueAt?: number;
    context?: string;
    owner?: User;
    availableActions: TaskAction[];
}
