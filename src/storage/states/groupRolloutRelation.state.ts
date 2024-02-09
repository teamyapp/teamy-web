


class GroupRolloutRelationState {
    constructor(
        public groupId: number,
        public rolloutId: number,
        public orderIndex: number,
    ) {}
    
    public static fromJson(json: any): GroupRolloutRelationState {
        return new GroupRolloutRelationState(json.groupId, json.rolloutId, json.orderIndex);
    }

    public static fromMutationPayload(json: any): GroupRolloutRelationState {
        return new GroupRolloutRelationState(json.GroupID, json.RolloutID, json.OrderIndex);
    }
}