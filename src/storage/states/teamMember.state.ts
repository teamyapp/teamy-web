export class TeamMemberState {
    public constructor(public teamId: number, public userId: number) {}

    public static fromMutationPayload(json: any): TeamMemberState {
        return new TeamMemberState(json.TeamID, json.UserID);
    }

    public static fromJson(json: any): TeamMemberState {
        return new TeamMemberState(json.teamId, json.userId);
    }
}
