import { toDate } from '@core/storage/states/parser';

export class TaskAwaitForRelationState {
    public constructor(
        public awaitingTaskId: number,
        public awaitForTaskId: number,
        public createdAt: Date,
    ) {}

    public static fromMutationPayload(json: any): TaskAwaitForRelationState {
        return new TaskAwaitForRelationState(
            json.AwaitingTaskID,
            json.AwaitForTaskID,
            toDate(json.CreatedAt)!,
        );
    }

    public static fromJson(json: any): TaskAwaitForRelationState {
        return new TaskAwaitForRelationState(
            json.awaitingTaskId,
            json.awaitForTaskId,
            toDate(json.createdAt)!,
        );
    }
}
