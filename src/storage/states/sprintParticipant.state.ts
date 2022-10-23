import { Duration, MILLIS_IN_NANOS } from '@lib/retry/duration';
import { toDate } from '@core/storage/states/parser';

export class SprintParticipantState {
    public constructor(
        public sprintId: number,
        public userId: number,
        public totalBandwidth: Duration,
        public unusedBandwidth: Duration,
        public createdAt: Date,
        public updatedAt?: Date,
    ) {}

    public static fromJson(json: any): SprintParticipantState {
        return new SprintParticipantState(
            json.sprintId,
            json.userId,
            Duration.fromString(json.totalBandwidth),
            Duration.fromString(json.unusedBandwidth),
            toDate(json.createdAt)!,
            toDate(json.updatedAt),
        );
    }

    public static fromMutationPayload(json: any): SprintParticipantState {
        return new SprintParticipantState(
            json.SprintID,
            json.UserID,
            new Duration(json.TotalBandwidth / MILLIS_IN_NANOS),
            new Duration(json.UnusedBandwidth / MILLIS_IN_NANOS),
            toDate(json.createdAt)!,
            toDate(json.updatedAt),
        );
    }
}
