import { toDate } from './parser';
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
