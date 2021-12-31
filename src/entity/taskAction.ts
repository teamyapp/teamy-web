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
        case 'Upcoming':
            return [
                TaskAction.Start,
                TaskAction.Delete,
                TaskAction.AssignOwner,
            ];
        case 'NeedAttention':
        case 'InProgress':
            return [
                TaskAction.Delete,
                TaskAction.AssignOwner,
                TaskAction.ReportBlocked,
                TaskAction.MarkComplete,
            ];
        case 'Delivered':
            return [TaskAction.Delete];
    }
}
