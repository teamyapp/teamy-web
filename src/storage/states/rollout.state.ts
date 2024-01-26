export class RolloutState {
    constructor(
        public id: number,
        public activatorId: number,
        public versionSelectorId: number,
        public isEnabled: boolean,
        public createdAt: Date,
        public updatedAt?: Date,
    ) {}

    public static fromMutationPayload(json: any): RolloutState {
        return new RolloutState(
            json.ID,
            json.ActivatorID,
            json.VersionSelectorID,
            json.IsEnabled,
            new Date(json.CreatedAt),
            new Date(json.UpdatedAt),
        );
    }

    public static fromJson(json: any): RolloutState {
        return new RolloutState(
            json.id,
            json.activatorId,
            json.versionSelectorId,
            json.isEnabled,
            new Date(json.createdAt),
            new Date(json.updatedAt),
        );
    }
}