import { AppSecret } from './appSecret';
import { AppVersion } from './appVersion';
import { Team } from './team';
import { TeamAppInstallation } from './teamAppInstallation';
import { Tag } from './tag';

export interface App {
    id: number;
    secrets: AppSecret[];
    totalInstallations: number;
    installations: TeamAppInstallation[];
    managedByTeam: Team;
    versions: AppVersion[];
    tags: Tag[];
    latestVersionForTeam(teamId?: number): AppVersion | undefined;
}
