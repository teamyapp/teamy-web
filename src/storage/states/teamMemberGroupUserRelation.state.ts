import { toDate } from '@core/storage/states/parser';

export class TeamMemberGroupUserRelation {
    public constructor(
        public groupId: number,
        public memberUserId: number,
    ) {}

    public static fromMutationPayload(json: any): TeamMemberGroupUserRelation {
        return new TeamMemberGroupUserRelation(
            json.GroupID,
            json.MemberUserID,
        );
    }

    public static fromJson(json: any): TeamMemberGroupUserRelation {
        return new TeamMemberGroupUserRelation(
            json.groupId,
            json.memberUserId,
        );
    }
}
