import { toDate } from '@core/storage/states/parser';

export class MessageState {
    public constructor(
        public id: number,
        public body: string,
        public threadId: number,
        public authorUserId: number,
        public createdAt: Date,
        public updatedAt?: Date,
    ) {}

    public static fromMutationPayload(json: any): MessageState {
        return new MessageState(
            json.ID,
            json.Body,
            json.ThreadID,
            json.AuthorUserID,
            toDate(json.CreatedAt)!,
            toDate(json.UpdatedAt),
        );
    }

    public static fromJson(json: any): MessageState {
        return new MessageState(
            json.id,
            json.body,
            json.threadId,
            json.authorUserId,
            toDate(json.createdAt)!,
            toDate(json.updatedAt),
        );
    }
}
