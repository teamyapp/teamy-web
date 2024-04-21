export type VersionSelectorType = 'STATIC' | 'EXPERIMENT';

export class VersionSelectorState {
    constructor(
        public id: number,
        public type: VersionSelectorType,
        public createdAt: Date,
        public updatedAt?: Date,
    ) {}

    public static fromMutationPayload(json: any): VersionSelectorState {
        return new VersionSelectorState(
            json.ID,
            json.Type,
            new Date(json.CreatedAt),
            new Date(json.UpdatedAt),
        );
    }

    public static fromJson(json: any): VersionSelectorState {
        return new VersionSelectorState(
            json.id,
            json.type,
            new Date(json.createdAt),
            new Date(json.updatedAt),
        );
    }
}

export class VersionSelectorVersionRelationState {
    constructor(
        public versionSelectorId: number,
        public versionNumber: number,
    ) {}

    public static fromMutationPayload(
        json: any,
    ): VersionSelectorVersionRelationState {
        return new VersionSelectorVersionRelationState(
            json.VersionSelectorID,
            json.VersionNumber,
        );
    }

    public static fromJson(json: any): VersionSelectorVersionRelationState {
        return new VersionSelectorVersionRelationState(
            json.versionSelectorId,
            json.versionNumber,
        );
    }
}
