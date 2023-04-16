export class DeleteTaskAwaitForRelationPayload {
    constructor(public awaitingTaskId: number, public awaitForTaskId: number) {}

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
    constructor(public sprintId: number, public userId: number) {}

    public static fromMutationPayload(
        json: any,
    ): DeleteSprintParticipantPayload {
        return new DeleteSprintParticipantPayload(json.SprintID, json.UserID);
    }
}

export class UpdateTeamActiveSprintPayload {
    constructor(public teamId: number, public sprintId: number) {}

    public static fromMutationPayload(
        json: any,
    ): UpdateTeamActiveSprintPayload {
        return new UpdateTeamActiveSprintPayload(json.TeamID, json.SprintID);
    }
}
