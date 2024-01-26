export type VersionSelectorType = 'STATIC' | 'EXPERIMENT'

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


export class StaticVersionSelectorState {
    constructor (
        public versionNumber: number,
    ) {}

    public static fromMutationPayload(json: any): StaticVersionSelectorState {
        return new StaticVersionSelectorState(
            json.VersionNumber,
        );
    }

    public static fromJson(json: any): StaticVersionSelectorState {
        return new StaticVersionSelectorState(
            json.versionNumber,
        );
    }
}


export class ExperimentVersionSelectorState {
    constructor (
        public versionNumbers: number[]
    ) {}

    public static fromMutationPayload(json: any): ExperimentVersionSelectorState {
        return new ExperimentVersionSelectorState(
            json.VersionNumbers,
        );
    }

    public static fromJson(json: any): ExperimentVersionSelectorState {
        return new ExperimentVersionSelectorState(
            json.versionNumbers,
        );
    }
}


