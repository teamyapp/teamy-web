import { Team } from './team';
import { AppVersion } from './appVersion';
import { AppSecret } from './appSecret';
import { TeamAppInstallation } from './teamAppInstallation';

export interface App {
    id: number;
    secrets: AppSecret[];
    totalInstallations: number;
    installations:  TeamAppInstallation[];
    managedByTeam: Team;
    versions: AppVersion[];
    latestVersionForTeam(teamId?: number): AppVersion | undefined;
}
