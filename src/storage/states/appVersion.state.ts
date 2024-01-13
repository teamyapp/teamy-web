import { MoneyState } from './money.state';
import { toDate } from './parser';

export class AppVersionState {
    public constructor(
        public number: number,
        public appName: string,
        public description: string,
        public changes: string[],
        public createdAt: Date,
        public creatorUserId: number,
        public iconUrl: string,
        public prices: MoneyState[],
        public isReady: boolean,
        public appId: number,
    ) {}

    public static fromMutationPayload(json: any): AppVersionState {
        return new AppVersionState(
            json.Number,
            json.AppName,
            json.Description,
            json.Changes,
            toDate(json.CreatedAt)!,
            json.CreatorUserID,
            json.IconUrl,
            json.Prices.map(MoneyState.fromMutationPayload),
            json.IsReady,
            json.AppID,
        );
    }

    public static fromJson(json: any): AppVersionState {
        return new AppVersionState(
            json.number,
            json.appName,
            json.description,
            json.changes,
            toDate(json.createdAt)!,
            json.creatorUserId,
            json.iconUrl,
            json.prices.map(MoneyState.fromJson),
            json.isReady,
            json.appId,
        );
    }
}
