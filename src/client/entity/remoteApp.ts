import { RemoteAppInstallation } from './remoteAppInstallation';
import { RemoteAppSecret } from './remoteAppSecret';
import { RemoteAppVersion } from './remoteAppVersion';
import { RemoteGroup } from './remoteGroup';
import { RemoteRollout } from './remoteRollout';
import { RemoteTag } from './remoteTag';
import { RemoteTeam } from './remoteTeam';

export interface RemoteApp {
    id: string;
    secrets: RemoteAppSecret[];
    totalInstallations: number;
    installations: RemoteAppInstallation[];
    latestVersionForTeam?: RemoteAppVersion;
    versions: RemoteAppVersion[];
    groups: RemoteGroup[];
    userRollouts: RemoteRollout[];
    teamRollouts: RemoteRollout[];
    managedByTeam: RemoteTeam;
    tags: RemoteTag[];
}
