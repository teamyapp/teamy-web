export class MemberGroupRelationState {
    constructor(
        public memberId: number,
        public groupId: number,
    ) {}

    public static fromJson(json: any): MemberGroupRelationState {
        return new MemberGroupRelationState(json.memberId, json.groupId);
    }

    public static fromMutationPayload(json: any): MemberGroupRelationState {
        return new MemberGroupRelationState(json.MemberID, json.GroupID);
    }
}
