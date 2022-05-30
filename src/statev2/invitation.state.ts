import { InvitationStatus } from '@core/statev2/invitationStatus';

export interface InvitationState {
    id: number;
    senderUserId: number;
    receiverFirstName?: string;
    receiverLastName?: string;
    receiverEmail?: string;
    receiverUserId?: number;
    joiningTeamId: number;
    expireAt: Date;
    createdAt: Date;
    updatedAt?: Date;
    status: InvitationStatus;
    code: string;
}
