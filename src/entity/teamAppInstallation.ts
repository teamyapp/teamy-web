import { AppVersion } from './appVersion';
import { Team } from './team';

export interface TeamAppInstallation {
    id: number;
    installedTeam: Team;
    activeAppVersion: AppVersion;
}
