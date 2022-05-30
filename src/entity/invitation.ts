import { Team } from '@core/entity/team';
import { User } from '@core/entity/user';

import { InvitationStatus } from './invitationStatus';

export interface Invitation {
    id: number;
    sender: User;
    receiverFirstName?: string;
    receiverLastName?: string;
    receiver?: User;
    joiningTeam: Team;
    status: InvitationStatus;
    code: string;
    createdAt: Date;
    expireAt: Date;
}
