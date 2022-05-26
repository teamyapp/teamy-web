import { InvitationStatus } from './invitationStatus';
import { Team } from './team';
import { User } from './user';

export interface Invitation {
    id: number;
    sender: User;
    receiverFirstName?: string;
    receiverLastName?: string;
    receiverEmail?: string;
    receiver?: User;
    joiningTeam: Team;
    expireAt: Date;
    createdAt: Date;
    updatedAt?: Date;
    status: InvitationStatus;
    code: string;
}
