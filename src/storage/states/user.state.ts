import { toDate } from './parser';

export class UserState {
    public constructor(
        public id: number,
        public firstName: string,
        public lastName: string,
        public createdAt: Date,
        public profileUrl?: string,
        public updatedAt?: Date,
    ) {}

    public static fromMutationPayload(json: any): UserState {
        return new UserState(
            json.ID,
            json.FirstName,
            json.LastName,
            toDate(json.CreatedAt)!,
            json.ProfileURL,
            toDate(json.UpdatedAt),
        );
    }

    public static fromJson(json: any): UserState {
        return new UserState(
            json.id,
            json.firstName,
            json.lastName,
            toDate(json.createdAt)!,
            json.profileUrl,
            toDate(json.updatedAt),
        );
    }
}
