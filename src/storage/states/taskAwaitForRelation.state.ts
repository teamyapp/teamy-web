export class TaskAwaitForRelationState {
    public constructor(
        public awaitingTaskId: number,
        public awaitForTaskId: number,
    ) {}

    public static fromMutationPayload(json: any): TaskAwaitForRelationState {
        return new TaskAwaitForRelationState(
            json.AwaitingTaskID,
            json.AwaitForTaskID,
        );
    }

    public static fromJson(json: any): TaskAwaitForRelationState {
        return new TaskAwaitForRelationState(
            json.awaitingTaskId,
            json.awaitForTaskId,
        );
    }
}
