import { toDate } from './parser';
import { Currency } from "./currency";
export type AppVersionStatus = 'INIT' | 'UPLOADING' | 'PROCESSING' | 'READY' | 'ERROR';

export class AppVersionState {
    public constructor(
        public number: number,
        public appName: string,
        public description: string,
        public createdAt: Date,
        public creatorUserId: number,
        public status: AppVersionStatus,
        public locked: boolean,
        public appId: number,
        public errorMessage?: string,
    ) {}

    public static fromMutationPayload(json: any): AppVersionState {
        return new AppVersionState(
            json.Number,
            json.AppName,
            json.Description,
            toDate(json.CreatedAt)!,
            json.CreatorUserID,
            json.Status,
            json.Locked,
            json.AppID,
            json.ErrorMessage,
        );
    }

    public static fromJson(json: any): AppVersionState {
        return new AppVersionState(
            json.number,
            json.appName,
            json.description,
            toDate(json.createdAt)!,
            json.creatorUserId,
            json.status,
            json.locked,
            json.appId,
            json.errorMessage,
        );
    }
}


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


export class AppVersionChangeState {
    public constructor(
        public appId: number,
        public versionNumber: number,
        public change: string,
    ) {}

    public static fromMutationPayload(json: any): AppVersionChangeState {
        return new AppVersionChangeState(
            json.AppID,
            json.VersionNumber,
            json.Change,
        );
    }

    public static fromJson(json: any): AppVersionChangeState {
        return new AppVersionChangeState(
            json.appId,
            json.versionNumber,
            json.change,
        );
    }
}
