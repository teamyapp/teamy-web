import { RemoteAppVersion } from './remoteAppVersion';
import { RemoteTeam } from './remoteTeam';

export interface RemoteAppInstallation {
    id: string;
    installedTeam: RemoteTeam;
    activeAppVersion?: RemoteAppVersion;
}
