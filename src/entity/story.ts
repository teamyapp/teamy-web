import { Priority } from './priority';
import { Task } from './task';
import { User } from './user';

export type StoryStatus = 'TODO' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';

export interface Story {
    id: number;
    name: string;
    owner: User;
    status: StoryStatus;
    priority?: Priority;
    creator: User;
    createdAt: Date;
    updatedAt?: Date;
    tasks: Task[];
    totalTasks: number;
    completedTasks: number;
}
