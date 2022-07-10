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
    'wechat'
];

export const accountProviderNames = new Map<AuthProvider, string>();
accountProviderNames.set('google', 'Google');
accountProviderNames.set('github', 'Github');
accountProviderNames.set('slack', 'Slack');
accountProviderNames.set('microsoft', 'Microsoft');
accountProviderNames.set('wechat', 'WeChat');

export interface LinkedUser {
    id: number,
    label: string
    authProvider: AuthProvider,
}