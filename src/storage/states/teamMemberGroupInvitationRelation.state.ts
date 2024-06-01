export class TeamMemberGroupInvitationRelation {
    public constructor(
        public groupId: number,
        public invitationId: number,
    ) {}

    public static fromMutationPayload(json: any): TeamMemberGroupInvitationRelation {
        return new TeamMemberGroupInvitationRelation(
            json.GroupID,
            json.InvitationID,
        );
    }

    public static fromJson(json: any): TeamMemberGroupInvitationRelation {
        return new TeamMemberGroupInvitationRelation(
            json.groupId,
            json.invitationId,
        );
    }
}
