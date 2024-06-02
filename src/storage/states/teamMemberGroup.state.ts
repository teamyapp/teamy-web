import { toDate } from '@core/storage/states/parser';

export class TeamMemberGroupState {
    public constructor(
        public id: number,
        public teamId: number,
        public name: string,
        public orderIndex: number,
        public createdAt: Date,
        public updatedAt?: Date,
    ) {}

    public static fromMutationPayload(json: any): TeamMemberGroupState {
        return new TeamMemberGroupState(
            json.ID,
            json.TeamID,
            json.Name,
            json.OrderIndex,
            toDate(json.CreatedAt)!,
            toDate(json.UpdatedAt),
        );
    }

    public static fromJson(json: any): TeamMemberGroupState {
        return new TeamMemberGroupState(
            json.id,
            json.teamId,
            json.name,
            json.orderIndex,
            toDate(json.createdAt)!,
            toDate(json.updatedAt),
        );
    }
}
