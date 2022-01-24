import { TaskStatus } from './taskStatus';

export interface TaskCreationInput {
    goal: string;
    context?: string;
    dueAt?: string;
    ownerUserId?: string | number;
    status?: TaskStatus;
}
