import { DragTaskActivityState } from "./dragTaskActivity.state";

export class TaskActivityState {
    public constructor(
        public taskId: number,
        public dragTaskActivity: DragTaskActivityState
    ) {}

    public static fromMutationPayload(json: any): TaskActivityState {
        return new TaskActivityState(
            json.TaskID,
            DragTaskActivityState.fromMutationPayload(json.DragTaskActivity)
        );
    }

    public static fromJson(json: any): TaskActivityState {
        return new TaskActivityState(
            json.taskId,
            DragTaskActivityState.fromJson(json.dragTaskActivity)
        )
    }
}
