export type AppRolloutRelationType = 'USER' | 'TEAM';

export class AppRolloutRelationState {
    constructor(
        public appId: number,
        public rolloutId: number,
        public type: AppRolloutRelationType,
    ) {}

    public static fromJson(json: any): AppRolloutRelationState {
        return new AppRolloutRelationState(
            json.appId,
            json.rolloutId,
            json.type,
        );
    }

    public static fromMutationPayload(json: any): AppRolloutRelationState {
        return new AppRolloutRelationState(
            json.AppID,
            json.RolloutID,
            json.Type,
        );
    }
}
