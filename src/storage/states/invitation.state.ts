import { InvitationStatus } from '@core/storage/states/invitationStatus';
import { toDate } from '@core/storage/states/parser';

export class InvitationState {
    public constructor(
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

    public static fromMutationPayload(json: any): InvitationState {
        return new InvitationState(
            json.ID,
            json.SenderUserID,
            json.TeamID,
            toDate(json.ExpireAt)!,
            json.Status,
            json.Code,
            toDate(json.CreatedAt)!,
            json.ReceiverFirstName,
            json.ReceiverLastName,
            json.ReceiverUserID,
            json.ReceiverEmail,
            toDate(json.UpdatedAt),
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
