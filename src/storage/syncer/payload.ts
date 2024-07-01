export class DeleteTaskAwaitForRelationPayload {
    constructor(
        public awaitingTaskId: number,
        public awaitForTaskId: number,
    ) {}

    public static fromMutationPayload(
        json: any,
    ): DeleteTaskAwaitForRelationPayload {
        return new DeleteTaskAwaitForRelationPayload(
            json.AwaitingTaskID,
            json.AwaitForTaskID,
        );
    }
}

export class DeleteSprintParticipantPayload {
    constructor(
        public sprintId: number,
        public userId: number,
    ) {}

    public static fromMutationPayload(
        json: any,
    ): DeleteSprintParticipantPayload {
        return new DeleteSprintParticipantPayload(json.SprintID, json.UserID);
    }
}
