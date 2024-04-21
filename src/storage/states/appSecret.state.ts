import { toDate } from './parser';

export class AppSecretState {
    public constructor(
        public id: number,
        public name: string,
        public addedAt: Date,
        public addedByUserId: number,
        public appId: number,
        public lastUsedAt?: Date,
        public token?: string,
    ) {}

    public static fromMutationPayload(json: any): AppSecretState {
        return new AppSecretState(
            json.ID,
            json.Name,
            toDate(json.AddedAt)!,
            json.AddedByUserID,
            json.AppID,
            toDate(json.LastUsedAt),
            json.Token,
        );
    }

    public static fromJson(json: any): AppSecretState {
        return new AppSecretState(
            json.id,
            json.name,
            toDate(json.addedAt)!,
            json.addedByUserId,
            json.appId,
            toDate(json.lastUsedAt),
            json.token,
        );
    }
}
