export class AppVersionChangeState {
    public constructor(
        public id: number,
        public appId: number,
        public versionNumber: number,
        public change: string,
    ) {}

    public static fromMutationPayload(json: any): AppVersionChangeState {
        return new AppVersionChangeState(
            json.ID,
            json.AppID,
            json.VersionNumber,
            json.Change,
        );
    }

    public static fromJson(json: any): AppVersionChangeState {
        return new AppVersionChangeState(
            json.id,
            json.appId,
            json.versionNumber,
            json.change,
        );
    }
}
