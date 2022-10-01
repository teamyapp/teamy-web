import { DragTaskActivityState } from './dragTaskActivity.state';

export class TaskActivityState {
    public constructor(
        public teamId: number,
        public taskId: number,
        public dragTaskActivity: DragTaskActivityState,
    ) {}

    public static fromMutationPayload(json: any): TaskActivityState {
        return new TaskActivityState(
            json.TeamID,
            json.TaskID,
            DragTaskActivityState.fromMutationPayload(json.DragTaskActivity),
        );
    }

    public static fromJson(json: any): TaskActivityState {
        return new TaskActivityState(
            json.teamId,
            json.taskId,
            DragTaskActivityState.fromJson(json.dragTaskActivity),
        );
    }
}
