export class SprintTaskRelationState {
    constructor(public sprintId: number, public taskId: number) {}

    public static fromJson(json: any): SprintTaskRelationState {
        return new SprintTaskRelationState(json.sprintId, json.taskId);
    }
}
