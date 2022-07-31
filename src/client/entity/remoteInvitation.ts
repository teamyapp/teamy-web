import { RemoteInvitationStatus } from './remoteInvitationStatus';
import { RemoteTeam } from './remoteTeam';
import { RemoteUser } from './remoteUser';

export interface RemoteInvitation {
    id: string;
    sender?: RemoteUser;
    receiverFirstName?: string;
    receiverLastName?: string;
    receiverEmail?: string;
    receiver?: RemoteUser;
    joiningTeam: RemoteTeam;
    expireAt: string;
    createdAt: string;
    updatedAt?: string;
    status?: RemoteInvitationStatus;
    code?: string;
}
