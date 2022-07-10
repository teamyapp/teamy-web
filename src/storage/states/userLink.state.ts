type AuthProvider = 'google' | 'github' | 'wechat';

export class UserLinkState {
    public constructor(
        public internalUserId: number,
        public authProvider: AuthProvider,
        public externalUserId: number,
        public externalUserLabel: string,
    ) {}

    public static fromMutationPayload(json: any): UserLinkState {
        return new UserLinkState(
            json.InternalUserID,
            json.AuthProvider,
            json.ExternalUserID,
            json.ExternalUserLabel,
        );
    }

    public static fromJson(json: any): UserLinkState {
        return new UserLinkState(
            json.internalUserId,
            json.authProvider,
            json.externalUserId,
            json.externalUserLabel,
        );
    }
}
