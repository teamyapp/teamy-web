import { RemoteInvitationStatus } from './remoteInvitationStatus';
import { RemoteTeam } from './remoteTeam';
import { RemoteUser } from './remoteUser';

export interface RemoteInvitation {
    id: number;
    sender?: RemoteUser;
    receiverFirstName?: string;
    receiverLastName?: string;
    receiverEmail?: string;
    receiver?: RemoteUser;
    joiningTeam: RemoteTeam;
    expireAt: Date;
    createdAt: Date;
    updatedAt?: Date;
    status?: RemoteInvitationStatus;
    code?: string;
}
