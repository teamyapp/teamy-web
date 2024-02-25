import { Currency } from "./currency";

export class AppVersionPriceState {
    public constructor(
        public appId: number,
        public versionNumber: number,
        public currency: Currency,
        public price: number,
    ) {}

    public static fromMutationPayload(json: any): AppVersionPriceState {
        return new AppVersionPriceState(
            json.AppID,
            json.VersionNumber,
            json.Currency,
            json.Price,
        );
    }

    public static fromJson(json: any): AppVersionPriceState {
        return new AppVersionPriceState(
            json.appId,
            json.versionNumber,
            json.currency,
            json.price,
        );
    }
}