export class SprintTaskRelationState {
    constructor(public sprintId: number, public taskId: number) {}

    public static fromJson(json: any): SprintTaskRelationState {
        return new SprintTaskRelationState(json.sprintId, json.taskId);
    }

    public static fromMutationPayload(json: any): SprintTaskRelationState {
        return new SprintTaskRelationState(
            json.SprintID,
            json.TaskID,
        );
    }
}
