export class GroupMemberRelationState {
    constructor(public memberId: number, public groupId: number) {}

    public static fromJson(json: any): GroupMemberRelationState {
        return new GroupMemberRelationState(json.memberId, json.groupId);
    }

    public static fromMutationPayload(json: any): GroupMemberRelationState {
        return new GroupMemberRelationState(json.MemberID, json.GroupID);
    }
}