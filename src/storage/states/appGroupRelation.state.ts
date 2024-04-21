export class AppGroupRelationState {
    constructor(public appId: number, public groupId: number) {}

    public static fromJson(json: any): AppGroupRelationState {
        return new AppGroupRelationState(json.appId, json.groupId);
    }

    public static fromMutationPayload(json: any): AppGroupRelationState {
        return new AppGroupRelationState(json.AppID, json.GroupID);
    }
}
