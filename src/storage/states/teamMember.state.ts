import { Duration, MILLIS_IN_NANOS } from '@core/entity/duration';
import { toDate } from '@core/storage/states/parser';

export class TeamMemberState {
    public constructor(
        public teamId: number,
        public userId: number,
        public weeklyBandwidth: Duration,
        public createdAt: Date,
        public updatedAt?: Date,
    ) {}

    public static fromMutationPayload(json: any): TeamMemberState {
        return new TeamMemberState(
            json.TeamID,
            json.UserID,
            new Duration(json.WeeklyBandwidth / MILLIS_IN_NANOS),
            toDate(json.CreatedAt)!,
            toDate(json.UpdatedAt),
        );
    }

    public static fromJson(json: any): TeamMemberState {
        return new TeamMemberState(
            json.teamId,
            json.userId,
            Duration.fromString(json.weeklyBandwidth),
            toDate(json.createdAt)!,
            toDate(json.updatedAt),
        );
    }
}
