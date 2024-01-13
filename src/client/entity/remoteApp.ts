import { RemoteAppInstallation } from './remoteAppInstallation';
import { RemoteAppSecret } from './remoteAppSecret';
import { RemoteAppVersion } from './remoteAppVersion';
import { RemoteTeam } from './remoteTeam';

export interface RemoteApp {
    id: string;
    secrets: RemoteAppSecret[];
    totalInstallations: number;
    installations: RemoteAppInstallation[];
    latestVersionForTeam?: RemoteAppVersion;
    versions: RemoteAppVersion[];
    managedByTeam: RemoteTeam;
}