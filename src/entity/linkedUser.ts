export type AuthProvider =
    | 'google'
    | 'github'
    | 'slack'
    | 'microsoft'
    | 'wechat';

export const authProviders: AuthProvider[] = [
    'google',
    'github',
    'slack',
    'microsoft',
    'wechat',
];

export const accountProviderNames: Record<AuthProvider, string> = {
    google: 'Google',
    github: 'Github',
    slack: 'Slack',
    microsoft: 'Microsoft',
    wechat: 'WeChat',
};

export interface LinkedUser {
    id: number;
    label: string;
    authProvider: AuthProvider;
}
