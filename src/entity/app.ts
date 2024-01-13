import { Team } from './team';
import { AppVersion } from './appVersion';
import { AppSecret } from './appSecret';
import { AppInstallation } from './appInstallation';

export interface App {
    id: number;
    secrets: AppSecret[];
    totalInstallations: number;
    installations:  AppInstallation[];
    managedByTeam: Team;
    versions: AppVersion[];
    latestVersionForTeam?: AppVersion;
}
