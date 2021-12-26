import Task from './Task';

export default interface TeamStatus {
    upcomingTasks: Task[];
    inProgressTasks: Task[];
    deliveredTasks: Task[];
}
