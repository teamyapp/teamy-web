export type GroupType = 'STATIC' | 'FILTER';

export class GroupState {
    constructor(
    public id: number,
    public type: GroupType,
    public name: string,
    public createdAt: Date,
    public rolloutIds: number[],
    public appId: number,
    public updatedAt?: Date,
    ) {}

    public static fromMutationPayload(json: any): GroupState {
        return new GroupState(
            json.ID,
            json.Type,
            json.Name,
            new Date(json.CreatedAt),
            json.RolloutIDs,
            json.AppID,
            new Date(json.UpdatedAt),
        );
    }

    public static fromJson(json: any): GroupState {
        return new GroupState(
            json.id,
            json.type,
            json.name,
            new Date(json.createdAt),
            json.rolloutIds,
            json.appId,
            new Date(json.updatedAt),
        );
    }
}

export class FilterGroupState {
    constructor(
        public filter: string,
        public memberCount: number,
    ) {}

    public static fromMutationPayload(json: any): FilterGroupState {
        return new FilterGroupState(
            json.Filter,
            json.MemberCount,
        );
    }

    public static fromJson(json: any): FilterGroupState {
        return new FilterGroupState(
            json.filter,
            json.memberCount,
        );
    }
}
