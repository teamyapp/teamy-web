import { RemoteSprint } from '@core/client/entity/remoteSprint';
import { RemoteTeamMember } from '@core/client/entity/remoteTeamMember';

import { RemoteInvitation } from './remoteInvitation';
import { RemoteTask } from './remoteTask';
import { RemoteTaskActivity } from './remoteTaskActivity';
import { RemoteUser } from './remoteUser';

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
}
