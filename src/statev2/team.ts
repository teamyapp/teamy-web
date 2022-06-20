import { Attributes } from '@lib/storage/mutation';

import { toDate } from './parser';

export class Team {
    constructor(
        public id: number,
        public name: string,
        public creatorUserId: number,
        public ownerUserId: number,
        public createdAt: Date,
        public iconUrl?: string,
        public updatedAt?: Date,
    ) {}

    static fromAttributes(attributes: Attributes): Team {
        return new Team(
            parseInt(attributes.ID),
            attributes.Name,
            parseInt(attributes.CreatorUserID),
            parseInt(attributes.OwnerUserID),
            toDate(attributes.CreatedAt)!,
            attributes.IconUrl,
            toDate(attributes.UpdatedAt),
        );
    }
}
