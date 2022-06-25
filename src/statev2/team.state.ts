import { Attributes } from '@lib/storage/mutation';

import { toDate } from './parser';

export class TeamState {
    constructor(
        public id: number,
        public name: string,
        public creatorUserId: number,
        public ownerUserId: number,
        public createdAt: Date,
        public iconUrl?: string,
        public updatedAt?: Date,
    ) {}

    static fromAttributes(attributes: Attributes): TeamState {
        return new TeamState(
            parseInt(attributes.ID),
            attributes.Name,
            parseInt(attributes.CreatorUserID),
            parseInt(attributes.OwnerUserID),
            toDate(attributes.CreatedAt)!,
            attributes.IconUrl,
            toDate(attributes.UpdatedAt),
        );
    }

    public static fromJson(json: any): TeamState {
        return new TeamState(
            json.id,
            json.name,
            json.creatorUserId,
            json.ownerUserId,
            toDate(json.createdAt)!,
            json.iconUrl,
            toDate(json.updatedAt),
        );
    }
}
