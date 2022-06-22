import { Attributes } from '@lib/storage/mutation';

import { toDate } from './parser';

export class UserState {
    constructor(
        public id: number,
        public firstName: string,
        public lastName: string,
        public createdAt: Date,
        public profileUrl?: string,
        public updatedAt?: Date,
    ) {}

    static fromAttributes(attributes: Attributes): UserState {
        return new UserState(
            parseInt(attributes.ID),
            attributes.FirstName,
            attributes.LastName,
            toDate(attributes.CreatedAt)!,
            attributes.ProfileUrl,
            toDate(attributes.UpdatedAt),
        );
    }

    public static fromJson(json: any): UserState {
        return new UserState(
          json.id,
          json.firstName,
          json.lastName,
          toDate(json.createdAt)!,
          json.profileUrl,
          toDate(json.updatedAt)
        )
    }
}
