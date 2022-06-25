import { Attributes } from '@lib/storage/mutation';

import { InvitationStatus } from '@core/statev2/invitationStatus';
import { toDate, toInt } from '@core/statev2/parser';

export class InvitationState {
    constructor(
        public id: number,
        public senderUserId: number,
        public teamId: number,
        public expireAt: Date,
        public status: InvitationStatus,
        public code: string,
        public createdAt: Date,
        public receiverFirstName?: string,
        public receiverLastName?: string,
        public receiverUserId?: number,
        public receiverEmail?: string,
        public updatedAt?: Date,
    ) {}

    public static fromAttributes(attributes: Attributes): InvitationState {
        return new InvitationState(
            parseInt(attributes.ID),
            parseInt(attributes.SenderUserID),
            parseInt(attributes.TeamID),
            toDate(attributes.ExpireAt)!,
            attributes.Status as InvitationStatus,
            attributes.code,
            toDate(attributes.CreatedAt)!,
            attributes.ReceiverFirstName,
            attributes.ReceiverLastName,
            toInt(attributes.ReceiverUserID),
            attributes.ReceiverEmail,
            toDate(attributes.UpdatedAt),
        );
    }

    public static fromJson(json: any): InvitationState {
        return new InvitationState(
            json.id,
            json.senderUserId,
            json.teamId,
            toDate(json.expireAt)!,
            json.status,
            json.code,
            toDate(json.createdAt)!,
            json.receiverFirstName,
            json.receiverLastName,
            json.receiverUserId,
            json.receiverEmail,
            toDate(json.updatedAt),
        );
    }
}
