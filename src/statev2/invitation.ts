import { Attributes } from '@lib/storage/mutation';

import { InvitationStatus } from '@core/statev2/invitationStatus';
import { toDate, toInt } from '@core/statev2/parser';

export class Invitation {
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

    static fromAttributes(attributes: Attributes): Invitation {
        return new Invitation(
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
}
