export enum TaskAction {
    Start = 'START',
    Delete = 'DELETE',
    AssignOwner = 'ASSIGN_OWNER',
    ReportBlocked = 'REPORT_BLOCKED',
    MarkComplete = 'MARK_COMPLETE',
    ViewDetail = 'VIEW_DETAIL',
}

export const AllActions = [
    TaskAction.Start,
    TaskAction.Delete,
    TaskAction.AssignOwner,
    TaskAction.MarkComplete,
    TaskAction.ViewDetail,
];
