import Task from './Task';

export default interface PersonalStatus {
    needAttentionTask?: Task;
    upcomingTasks: Task[];
    deliveredTasks: Task[];
}
