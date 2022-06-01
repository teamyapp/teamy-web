import Cookies from 'js-cookie';

import { FetchHTTPClient } from '@lib/network/FetchHTTP.client';

import { Environment } from '@core/env/environment';

import { Config, getConfig } from './config';

const accessTokenKey = 'accessToken';
const signInRedirectKey = 'signInRedirect';
const redirectUrlParam = 'redirectUrl';
export const accessTokenParam = 'accessToken';

export class IdentityClient {
    private readonly httpClient = new FetchHTTPClient();
    private readonly config: Config;

    constructor(
        env: Environment,
        private signInFinishLink: string,
        private homePageUrl: string,
    ) {
        this.config = getConfig(env);
    }

    public getAccessToken(): string {
        return Cookies.get(accessTokenKey) || '';
    }

    public async isSignedIn(): Promise<boolean> {
        const token = this.getAccessToken();
        if (!token || token.length === 0) {
            return false;
        }

        return await this.verifyToken(token);
    }

    public trySignIn() {
        const currUrl = window.location.href;
        this.saveSignInRedirectUrl(currUrl);
        window.location.replace(this.config.signInLink);
    }

    public tryOAuthSignIn(authProvider: string) {
        const signInApi = new URL(
            `${this.config.apiBaseEndpoint}/sign-in/oauth/${authProvider}`,
        );
        signInApi.searchParams.set(redirectUrlParam, this.signInFinishLink);
        window.location.replace(signInApi.toString());
    }

    public finishSignIn(accessToken: string) {
        Cookies.set(accessTokenKey, accessToken, {
            domain: this.config.cookieDomain,
            secure: this.config.cookieSecure,
        });
        const redirectUrl = localStorage.getItem(signInRedirectKey);
        localStorage.removeItem(signInRedirectKey);
        window.location.replace(redirectUrl || this.homePageUrl);
    }

    private saveSignInRedirectUrl(redirectUrl: string): void {
        localStorage.setItem(signInRedirectKey, redirectUrl);
    }

    private async verifyToken(accessToken: string): Promise<boolean> {
        const result = await this.httpClient.request(
            `${this.config.apiBaseEndpoint}/verify-token`,
            {
                method: 'POST',
                body: accessToken,
            },
        );
        return result[1] === null;
    }
}
