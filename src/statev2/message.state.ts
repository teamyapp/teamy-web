import { Attributes } from '@lib/storage/mutation';

import { toDate } from '@core/statev2/parser';

export class MessageState {
    constructor(
        public id: number,
        public body: string,
        public threadId: number,
        public authorUserId: number,
        public createdAt: Date,
        public updatedAt?: Date,
    ) {}

    public static fromAttributes(attributes: Attributes): MessageState {
        return new MessageState(
            parseInt(attributes.ID),
            attributes.Body,
            parseInt(attributes.ThreadID),
            parseInt(attributes.AuthorUserID),
            toDate(attributes.CreatedAt)!,
            toDate(attributes.UpdatedAt),
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
