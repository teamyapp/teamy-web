import { toDate } from './parser';

export class TeamState {
    public constructor(
        public id: number,
        public name: string,
        public creatorUserId: number,
        public ownerUserId: number,
        public createdAt: Date,
        public iconUrl?: string,
        public updatedAt?: Date,
        public activeSprintId?: number,
    ) {}

    public static fromMutationPayload(json: any): TeamState {
        return new TeamState(
            json.ID,
            json.Name,
            json.CreatorUserID,
            json.OwnerUserID,
            toDate(json.CreatedAt)!,
            json.IconURL,
            toDate(json.UpdatedAt),
            json.ActiveSprintID,
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
            json.activeSprintId,
        );
    }
}
