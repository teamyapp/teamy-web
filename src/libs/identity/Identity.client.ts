import Cookies from 'js-cookie';

import { UserLink } from '@lib/identity/userLink';
import { HTTPClient } from '@lib/network/HTTP.client';

import { Environment } from '@core/env/environment';

import { Config, getConfig } from './config';

const accessTokenKey = 'accessToken';
const signInRedirectKey = 'signInRedirect';
const redirectUrlParam = 'redirectUrl';
export const accessTokenParam = 'accessToken';

export class IdentityClient {
    private readonly config: Config;

    constructor(
        env: Environment,
        private signInFinishLink: string,
        private homePageUrl: string,
        private httpClient: HTTPClient,
    ) {
        this.config = getConfig(env);
    }

    public async isSignedIn(): Promise<boolean> {
        const token = getAccessToken();
        if (!token || token.length === 0) {
            return false;
        }

        return await this.verifyToken(token);
    }

    public trySignIn() {
        const currUrl = window.location.href;
        saveSignInRedirectUrl(currUrl);
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
        this.redirectBack();
    }

    public redirectBack() {
        const redirectUrl = localStorage.getItem(signInRedirectKey);
        localStorage.removeItem(signInRedirectKey);
        window.location.replace(redirectUrl || this.homePageUrl);
    }

    public async listUserLinks(): Promise<UserLink[]> {
        const result = await this.httpClient.request(
            `${this.config.apiBaseEndpoint}/user-links`,
            {
                method: 'GET',
            },
        );

        return result[0] ? JSON.parse(result[0]) : [];
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

export function getAccessToken(): string {
    return Cookies.get(accessTokenKey) || '';
}

function saveSignInRedirectUrl(redirectUrl: string): void {
    localStorage.setItem(signInRedirectKey, redirectUrl);
}
