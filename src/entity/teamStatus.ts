import Task from './task';

export default interface TeamStatus {
    upcomingTasks: Task[];
    inProgressTasks: Task[];
    deliveredTasks: Task[];
}
