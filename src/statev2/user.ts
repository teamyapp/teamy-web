import { Attributes } from '@lib/storage/mutation';

import { toDate } from './parser';

export class User {
    constructor(
        public id: number,
        public firstName: string,
        public lastName: string,
        public createdAt: Date,
        public profileUrl?: string,
        public updatedAt?: Date,
    ) {}

    static fromAttributes(attributes: Attributes): User {
        return new User(
            parseInt(attributes.ID),
            attributes.FirstName,
            attributes.LastName,
            toDate(attributes.CreatedAt)!,
            attributes.ProfileUrl,
            toDate(attributes.UpdatedAt),
        );
    }
}
