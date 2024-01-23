import { RemoteAppInstallation } from './remoteAppInstallation';
import { RemoteAppSecret } from './remoteAppSecret';
import { RemoteAppVersion } from './remoteAppVersion';
import { RemoteRollout } from './remoteRollout';
import { RemoteTag } from './remoteTag';
import { RemoteTeam } from './remoteTeam';
import { RemoteTeamGroup } from './remoteTeamGroup';
import { RemoteUserGroup } from './remoteUserGroup';

export interface RemoteApp {
    id: string;
    secrets: RemoteAppSecret[];
    totalInstallations: number;
    installations: RemoteAppInstallation[];
    latestVersionForTeam?: RemoteAppVersion;
    versions: RemoteAppVersion[];
    userGroups: RemoteUserGroup[];
    teamGroups: RemoteTeamGroup[];
    userRollouts: RemoteRollout[];
    teamRollouts: RemoteRollout[];
    managedByTeam: RemoteTeam;
    tags: RemoteTag[];
}
