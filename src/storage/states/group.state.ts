export type GroupType = 'STATIC' | 'FILTER';
export type GroupMemberType = 'USER' | 'TEAM';

export class GroupState {
    constructor(
        public id: number,
        public type: GroupType,
        public memberType: GroupMemberType,
        public name: string,
        public createdAt: Date,
        public updatedAt?: Date,
    ) {}

    public static fromMutationPayload(json: any): GroupState {
        return new GroupState(
            json.ID,
            json.Type,
            json.MemberType,
            json.Name,
            new Date(json.CreatedAt),
            new Date(json.UpdatedAt),
        );
    }

    public static fromJson(json: any): GroupState {
        return new GroupState(
            json.id,
            json.type,
            json.memberType,
            json.name,
            new Date(json.createdAt),
            new Date(json.updatedAt),
        );
    }
}

export class FilterGroupState {
    constructor(public filter: string) {}

    public static fromMutationPayload(json: any): FilterGroupState {
        return new FilterGroupState(json.Filter);
    }

    public static fromJson(json: any): FilterGroupState {
        return new FilterGroupState(json.filter);
    }
}
