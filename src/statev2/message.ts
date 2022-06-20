import { Attributes } from '@lib/storage/mutation';

import { toDate } from '@core/statev2/parser';

export class Message {
    constructor(
        public id: number,
        public body: string,
        public threadId: number,
        public authorUserId: number,
        public createdAt: Date,
        public updatedAt?: Date,
    ) {}

    static fromAttributes(attributes: Attributes): Message {
        return new Message(
            parseInt(attributes.ID),
            attributes.Body,
            parseInt(attributes.ThreadID),
            parseInt(attributes.AuthorUserID),
            toDate(attributes.CreatedAt)!,
            toDate(attributes.UpdatedAt),
        );
    }
}
