import { Team } from "./team";
import { AppVersion } from "./appVersion";

export interface AppInstallation {
    id: number;
    installedTeam: Team;
    activeAppVersion: AppVersion;
}