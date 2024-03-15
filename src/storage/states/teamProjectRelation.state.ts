


export class TeamProjectRelationState {
    public constructor(public teamId: number, public projectId: number) {}

    public static fromMutationPayload(json: any): TeamProjectRelationState {
        return new TeamProjectRelationState(json.TeamID, json.ProjectID);
    }

    public static fromJson(json: any): TeamProjectRelationState {
        return new TeamProjectRelationState(json.teamId, json.projectId);
    }
}