import { TaskAction } from './TaskAction';

export default interface Task {
    id: number;
    goal: string;
    dueAt?: number;
    context?: string;
    ownerUserId?: number;
    effort?: number;
    numOfUnknowns?: number;
    availableActions: TaskAction[];
}
