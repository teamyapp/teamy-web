import { InvitationStatus } from '@core/state/invitationStatus';

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

export function parseInvitationState(invitationJSON: any): InvitationState {
    return {
        id: invitationJSON.id,
        senderUserId: invitationJSON.senderUserId,
        receiverFirstName: invitationJSON.receiverFirstName,
        receiverLastName: invitationJSON.receiverLastName,
        receiverEmail: invitationJSON.receiverEmail,
        receiverUserId: invitationJSON.receiverUserId,
        joiningTeamId: invitationJSON.joiningTeamId,
        expireAt: new Date(invitationJSON.expireAt),
        createdAt: new Date(invitationJSON.createdAt),
        updatedAt: invitationJSON.updatedAt
            ? new Date(invitationJSON.updatedAt)
            : invitationJSON.updatedAt,
        status: invitationJSON.status,
        code: invitationJSON.code,
    };
}
