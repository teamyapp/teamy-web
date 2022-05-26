import { Invitation } from '@core/entityv2/invitation';

export interface UpdateInvitationInput {
    receiverFirstName?: string;
    receiverLastName?: string;
    expireAt: Date;
}

export class InvitationClient {
    getInvitations(teamId: number): Invitation[] {
        // TODO: implement me
    }

    updateInvitation(invitationId: number, input: UpdateInvitationInput): Invitation {
        // TODO: implement me
    }

    deleteInvitation(invitationId: number): Invitation {
        // TODO: implement me
    }

    getInvitation(invitationId: number, invitationCode: string): Invitation {
        // TODO: implement me
    }

    acceptInvitation(invitationId: number, invitationCode: string): Invitation {
        // TODO: implement me
    }

    declineInvitation(invitationId: number, invitationCode: string): Invitation {
        // TODO: implement me
    }
}
