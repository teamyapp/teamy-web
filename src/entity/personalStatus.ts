import { Task } from './task';

export interface PersonalStatus {
    needAttentionTask?: Task;
    upcomingTasks: Task[];
    deliveredTasks: Task[];
}
