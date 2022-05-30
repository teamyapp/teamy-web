import { TaskStatus } from '@core/entity/taskStatus';

export enum TaskAction {
    Start = 'START',
    Delete = 'DELETE',
    AssignOwner = 'ASSIGN_OWNER',
    ReportBlocked = 'REPORT_BLOCKED',
    MarkComplete = 'MARK_COMPLETE',
    ViewDetail = 'VIEW_DETAIL',
}

export function getActions(status: TaskStatus) {
    switch (status) {
        case 'UPCOMING':
            return [
                TaskAction.Start,
                TaskAction.Delete,
                TaskAction.AssignOwner,
            ];
        case 'NEED_ATTENTION':
        case 'IN_PROGRESS':
            return [
                TaskAction.MarkComplete,
                TaskAction.ReportBlocked,
                TaskAction.AssignOwner,
                TaskAction.Delete,
            ];
        case 'DELIVERED':
            return [TaskAction.Delete, TaskAction.AssignOwner];
    }
}
