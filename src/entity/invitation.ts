import { Team } from '@core/entity/team';
import { User } from '@core/entity/user';

import { InvitationStatus } from './invitationStatus';

export interface Invitation {
    id: string;
    sender: User;
    receiverFirstName: string;
    receiverLastName: string;
    receiver?: User;
    team: Team;
    status: InvitationStatus;
    code: string;
    createdAt: string;
    expireAt: string;
}
