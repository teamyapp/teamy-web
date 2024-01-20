import { Team } from "./team";
import { AppVersion } from "./appVersion";

export interface TeamAppInstallation {
    id: number;
    installedTeam: Team;
    activeAppVersion: AppVersion;
}