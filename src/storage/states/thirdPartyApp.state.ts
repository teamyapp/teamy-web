import { AppVersionState } from './appVersion.state';

export class ThirdPartyAppState {
    public constructor(
        public id: number,
        public secretIds: number[],
        public installationIds: number[],
        public totalInstallations: number,
        public managedByTeamId: number,
        public tagIds: Set<number>,
        public versions: Record<number, AppVersionState>,
    ) {}

    public static fromMutationPayload(json: any): ThirdPartyAppState {
        const versions: Record<number, AppVersionState> = {};

        for (const version of json.Versions) {
            versions[version.Number] =
                AppVersionState.fromMutationPayload(version);
        }

        return new ThirdPartyAppState(
            json.ID,
            json.SecretIDs,
            json.InstallationIDs,
            json.TotalInstallations,
            json.ManagedByTeamID,
            json.TagIDs,
            versions
        );
    }

    public static fromJson(json: any): ThirdPartyAppState {
        const versions: Record<number, AppVersionState> = {};
        for (const version of json.versions) {
            versions[version.number] = AppVersionState.fromJson(version);
        }

        return new ThirdPartyAppState(
            json.id,
            json.secretIds,
            json.installationIds,
            json.totalInstallations,
            json.managedByTeamId,
            json.tagIds,
            versions
        );
    }
}
