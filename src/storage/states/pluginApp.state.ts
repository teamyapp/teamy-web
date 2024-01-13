import { AppVersionState } from './appVersion.state';

export class PluginAppState {
    public constructor(
        public id: number,
        public secretIds: number[],
        public installationIds: number[],
        public totalInstallations: number,
        public managedByTeamId: number,
        public versions: Record<number, AppVersionState>,
        public latestVersionForTeam?: number,
    ) {}

    public static fromMutationPayload(json: any): PluginAppState {
        return new PluginAppState(
            json.ID,
            json.SecretIDs,
            json.InstallationIDs,
            json.TotalInstallations,
            json.ManagedByTeamID,
            json.Versions.reduce(
                (acc: Record<number, AppVersionState>, version: any) => {
                    acc[version.Number] =
                        AppVersionState.fromMutationPayload(version);
                    return acc;
                },
                {},
            ),
            json.LatestVersionForTeamNumber,
        );
    }

    public static fromJson(json: any): PluginAppState {
        return new PluginAppState(
            json.id,
            json.secretIds,
            json.installationIds,
            json.totalInstallations,
            json.managedByTeamId,
            json.versions.reduce(
                (acc: Record<number, AppVersionState>, version: any) => {
                    acc[version.number] = AppVersionState.fromJson(version);
                    return acc;
                },
                {},
            ),
            json.latestVersionForTeam,
        );
    }
}
