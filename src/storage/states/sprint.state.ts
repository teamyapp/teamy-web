import { toDate } from '@core/storage/states/parser';

export class SprintState {
    public constructor(
        public id: number,
        public startAt: Date,
        public endAt: Date,
        public createdAt: Date,
        public owningTeamId: number,
    ) {}

    public static fromMutationPayload(json: any): SprintState {
        return new SprintState(
            json.ID,
            toDate(json.StartAt)!,
            toDate(json.EndAt)!,
            toDate(json.CreatedAt)!,
            json.OwningTeamID,
        );
    }

    public static fromJson(json: any): SprintState {
        return new SprintState(
            json.id,
            toDate(json.startAt)!,
            toDate(json.endAt)!,
            toDate(json.createdAt)!,
            json.owningTeamID,
        );
    }
}
