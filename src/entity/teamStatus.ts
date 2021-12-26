import Task from './task';

export interface TeamStatus {
    upcomingTasks: Task[];
    inProgressTasks: Task[];
    deliveredTasks: Task[];
}
