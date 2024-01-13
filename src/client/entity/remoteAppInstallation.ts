
import { RemoteTeam } from "./remoteTeam";
import { RemoteAppVersion } from "./remoteAppVersion";

export interface RemoteAppInstallation {
    id: string;
    installedTeam: RemoteTeam;
    activeAppVersion: RemoteAppVersion;
}