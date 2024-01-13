export class AppInstallationState {
    public constructor(
        public id: number,
        public installedTeamId: number,
        public appId: number,
        public appVersionNumber: number,
    ) {}

    public static fromMutationPayload(json: any): AppInstallationState {
        return new AppInstallationState(
            json.ID,
            json.InstalledTeamID,
            json.AppID,
            json.AppVersionNumber,
        );
    }

    public static fromJson(json: any): AppInstallationState {
        return new AppInstallationState(
            json.id,
            json.installedTeamId,
            json.appId,
            json.appVersionNumber,
        );
    }
}
