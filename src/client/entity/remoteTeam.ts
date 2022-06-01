import { RemoteInvitation } from './remoteInvitation';
import { RemoteTask } from './remoteTask';
import { RemoteUser } from './remoteUser';

export interface RemoteTeam {
    id: string;
    name?: string;
    iconUrl?: string;
    createdAt?: string;
    creator?: RemoteUser;
    owner?: RemoteUser;
    members?: RemoteUser[];
    tasks?: RemoteTask[];
    invitations?: RemoteInvitation[];
}
