import { TaskStatus } from '@core/entity/taskStatus';

export type TaskAction =
    | 'START'
    | 'DELETE'
    | 'ASSIGN_OWNER'
    | 'REPORT_BLOCKED'
    | 'MARK_COMPLETED'
    | 'VIEW_DETAIL';

export function getActions(status: TaskStatus): TaskAction[] {
    switch (status) {
        case 'UPCOMING':
            return ['START', 'DELETE', 'ASSIGN_OWNER'];
        case 'IN_PROGRESS':
            return [
                'MARK_COMPLETED',
                'REPORT_BLOCKED',
                'ASSIGN_OWNER',
                'DELETE',
            ];
        case 'DELIVERED':
            return ['DELETE', 'ASSIGN_OWNER'];
        default:
            return [];
    }
}
