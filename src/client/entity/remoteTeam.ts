import { RemoteInvitation } from './remoteInvitation';
import { RemoteTask } from './remoteTask';
import { RemoteUser } from './remoteUser';

export interface RemoteTeam {
    id: number;
    name?: string;
    iconUrl?: string;
    createdAt?: Date;
    creator?: RemoteUser;
    members?: RemoteUser[];
    tasks?: RemoteTask[];
    invitations?: RemoteInvitation[];
}
