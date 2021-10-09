import {TaskAction} from './TaskAction';

export default interface Task {
    id: number;
    goal: string;
    dueAt: number;
    effort: number;
    availableActions: TaskAction[];
}