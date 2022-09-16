export class TaskActivityState {
    public constructor(
        public taskId: number,
        public teamId: number,
        public isDragging: boolean,
        public dragByUserId: number,
        public draggingClientId: number,
    ) {}

    public static fromMutationPayload(json: any): TaskActivityState {
        return new TaskActivityState(
            json.TaskID,
            json.TeamID,
            json.IsDragging,
            json.DragByUserID,
            json.DraggingClientID,
        );
    }

    public static fromJson(json: any): TaskActivityState {
        return new TaskActivityState(
            json.taskId,
            json.teamId,
            json.isDragging,
            json.dragByUserId,
            json.draggingClientId,
        )
    }
}
