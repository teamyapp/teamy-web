import { DragTaskActivity } from "./DragTaskActivity";

export class TaskActivityState {
    public constructor(
        public taskId: number,
        public dragTaskActivity: DragTaskActivity
    ) {}

    public static fromMutationPayload(json: any): TaskActivityState {
        return new TaskActivityState(
            json.TaskID,
            DragTaskActivity.fromMutationPayload(json.DragTaskActivity)
        );
    }

    public static fromJson(json: any): TaskActivityState {
        return new TaskActivityState(
            json.taskId,
             DragTaskActivity.fromJson(json.dragTaskActivity)
        )
    }
}
