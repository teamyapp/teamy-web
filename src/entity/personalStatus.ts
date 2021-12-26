import Task from './task';

export default interface PersonalStatus {
    needAttentionTask?: Task;
    upcomingTasks: Task[];
    deliveredTasks: Task[];
}
