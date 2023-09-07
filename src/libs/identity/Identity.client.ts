import Cookies from 'js-cookie';

import { UserLink } from '@lib/identity/userLink';
import { HTTPClient } from '@lib/network/HTTP.client';

import { IdentityConfig } from './config';

const accessTokenKey = 'accessToken';
const signInRedirectKey = 'signInRedirect';
const redirectUrlParam = 'redirectUrl';
export const accessTokenParam = 'accessToken';

export class IdentityClient {
    constructor(
        private readonly signInFinishLink: string,
        private readonly homePageUrl: string,
        private readonly httpClient: HTTPClient,
        private readonly config: IdentityConfig,
    ) {}

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

    public signOut() {
        Cookies.remove(accessTokenKey, {
            domain: this.config.cookieDomain,
            secure: this.config.cookieSecure,
        });
        this.trySignIn();
    }

    public redirectBack() {
        const redirectUrl = localStorage.getItem(signInRedirectKey);
        localStorage.removeItem(signInRedirectKey);
        window.location.replace(redirectUrl || this.homePageUrl);
    }

    public async createUserLink(authProvider: string, redirectUrl: string) {
        const createUserLinkApi = new URL(
            `${this.config.apiBaseEndpoint}/user-links/${authProvider}/create`,
        );
        createUserLinkApi.searchParams.set(redirectUrlParam, redirectUrl);
        const [result] = await this.httpClient.request(
            createUserLinkApi.toString(),
            {
                method: 'GET',
            },
        );
        window.location.replace(result!.body!);
    }

    public async listUserLinks(): Promise<UserLink[]> {
        const [result] = await this.httpClient.request(
            `${this.config.apiBaseEndpoint}/user-links`,
            {
                method: 'GET',
            },
        );
        return result?.body ? JSON.parse(result.body) : [];
    }

    public async deleteUserLink(authProvider: string): Promise<void> {
        await this.httpClient.request(
            `${this.config.apiBaseEndpoint}/user-links/${authProvider}/delete`,
            {
                method: 'DELETE',
            },
        );
    }

    private async verifyToken(accessToken: string): Promise<boolean> {
        const [, error] = await this.httpClient.request(
            `${this.config.apiBaseEndpoint}/verify-token`,
            {
                method: 'POST',
                body: accessToken,
            },
        );
        return error === undefined;
    }
}

export function getAccessToken(): string {
    return Cookies.get(accessTokenKey) || '';
}

function saveSignInRedirectUrl(redirectUrl: string): void {
    localStorage.setItem(signInRedirectKey, redirectUrl);
}
