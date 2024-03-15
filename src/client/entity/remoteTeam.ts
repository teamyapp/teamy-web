import { RemoteSprint } from '@core/client/entity/remoteSprint';
import { RemoteTeamMember } from '@core/client/entity/remoteTeamMember';

import { RemoteApp } from './remoteApp';
import { RemoteAppInstallation } from './remoteAppInstallation';
import { RemoteInvitation } from './remoteInvitation';
import { RemoteTask } from './remoteTask';
import { RemoteTaskActivity } from './remoteTaskActivity';
import { RemoteUser } from './remoteUser';
import { RemoteProject } from './remoteProject';

export interface RemoteTeam {
    id: string;
    name?: string;
    iconUrl?: string;
    createdAt?: string;
    creator?: RemoteUser;
    owner?: RemoteUser;
    members?: RemoteTeamMember[];
    tasks?: RemoteTask[];
    invitations?: RemoteInvitation[];
    sprints?: RemoteSprint[];
    taskActivities?: RemoteTaskActivity[];
    activeSprint?: RemoteSprint;
    managedApps?: RemoteApp[];
    appInstallations?: RemoteAppInstallation[];
    projects: RemoteProject[];
}
