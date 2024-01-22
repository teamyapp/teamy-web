export class TeamAppVersionState {
    public constructor(
        public teamId: number,
        public appId: number,
        public appVersion: number,
    ) {}

    public static fromMutationPayload(json: any): TeamAppVersionState {
        return new TeamAppVersionState(
            json.TeamID,
            json.AppID,
            json.AppVersion,
        );
    }

    public static fromJson(json: any): TeamAppVersionState {
        return new TeamAppVersionState(
            json.teamId,
            json.appId,
            json.appVersion,
        );
    }
}