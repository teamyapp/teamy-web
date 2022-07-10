type AuthProvider = 'google' | 'github' | 'wechat';

export interface UserLink {
    internalUserId: number;
    authProvider: AuthProvider;
    externalUserId: number;
    externalUserLabel: string;
}
