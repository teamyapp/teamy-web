import { AppVersionState } from './appVersion.state';

export class PluginAppState {
    public constructor(
        public id: number,
        public secretIds: number[],
        public installationIds: number[],
        public totalInstallations: number,
        public managedByTeamId: number,
        public versions: Record<number, AppVersionState>,
        public latestVersionNumberForTeam?: number,
    ) {}

    public static fromMutationPayload(json: any): PluginAppState {
        const versions = json.Versions.reduce(
            (acc: Record<number, AppVersionState>, version: any) => {
                acc[version.Number] =
                    AppVersionState.fromMutationPayload(version);
                return acc;
            },
            {},
        );

        return new PluginAppState(
            json.ID,
            json.SecretIDs,
            json.InstallationIDs,
            json.TotalInstallations,
            json.ManagedByTeamID,
            versions,
            json.LatestVersionForTeamNumber,
        );
    }

    public static fromJson(json: any): PluginAppState {
        const versions = json.versions.reduce(
            (acc: Record<number, AppVersionState>, version: any) => {
                acc[version.number] = AppVersionState.fromJson(version);
                return acc;
            },
            {},
        );

        return new PluginAppState(
            json.id,
            json.secretIds,
            json.installationIds,
            json.totalInstallations,
            json.managedByTeamId,
            versions,
            json.latestVersionForTeam,
        );
    }
}
