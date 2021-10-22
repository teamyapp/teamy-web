import Task from './Task';

export default interface PersonalStatus {
    taskNeedAttention?: Task;
    upcomingTasks: Task[];
    deliveredTasks: Task[];
}
