import { chan, Channel, PutChannel, select } from '@creatcodebuild/csp';
import Cookies from 'js-cookie';
import { Environment } from '../env/environment';
import { Errors } from '../ext/errors';
import { Result } from '../ext/result';
import { HTTPClient } from '../network/HTTP.client';
import { IChannel } from '../network/IChannel';
import { WebSocketChannel } from '../network/WebSocketChannel';
import { Config, getConfig } from './config';

const accessTokenKey = 'accessToken';

export class IdentityClient {
    private readonly config: Config;
    private readonly webSocketBaseEndpoint: string;
    private readonly httpBaseEndpoint: string;
    private readonly httpClient: HTTPClient;
    private readonly onShowSignInOptionsCh: Channel<null> = chan();
    private readonly onShowSignInResultCh: Channel<Errors> = chan();
    private channel?: IChannel;

    constructor(env: Environment, httpClient: HTTPClient) {
        this.config = getConfig(env);
        this.webSocketBaseEndpoint = `${this.config.webSocketProtocol}://${this.config.apiBaseEndpoint}`;
        this.httpBaseEndpoint = `${this.config.httpProtocol}://${this.config.apiBaseEndpoint}`;
        this.httpClient = httpClient;
    }

    public getAccessToken(): string {
        return Cookies.get(accessTokenKey) || '';
    }

    public async isSignedIn(): Promise<boolean> {
        const accessToken = this.getAccessToken();
        if (accessToken == null || accessToken.length === 0) {
            return false;
        }
        return this.verifyToken(accessToken);
    }

    public async prepareSignIn(): Promise<Result<number, Errors>> {
        let error = null;

        for (let retry = 0; retry < 5; retry++) {
            let sessionId: number | null;
            [sessionId, error] = await this.getSessionId();
            if (error) {
                continue;
            }

            this.channel = await this.getChannel(sessionId!);
            return [sessionId, null];
        }
        return [null, error];
    }

    public tryOAuthSignIn(oauthProvider: string, sessionID: number): void {
        const oauthURL = new URL(
            `${this.httpBaseEndpoint}/sign-in/oauth/${oauthProvider}`,
        );
        oauthURL.searchParams.set('session-id', `${sessionID}`);
        window.open(oauthURL.href);
    }

    public async waitForSignFinish(): Promise<Errors | null> {
        const [accessToken, error] = await readMessage(
            this.channel!.onMessageReceived(),
            this.channel!.onError(),
        );
        if (!error) {
            this.saveAccessToken(accessToken!);
        }
        return error;
    }

    public onShowSignInOptions(): Channel<null> {
        return this.onShowSignInOptionsCh;
    }

    public onShowSignInResult(): Channel<Errors> {
        return this.onShowSignInResultCh;
    }

    private async getChannel(sessionId: number): Promise<IChannel> {
        const channel: IChannel = new WebSocketChannel(
            `${this.webSocketBaseEndpoint}/sign-in/session/${sessionId}/subscribe`,
        );
        await channel.open();
        return channel;
    }

    private saveAccessToken(accessToken: string): void {
        Cookies.set(accessTokenKey, accessToken, {
            domain: this.config.cookieDomain,
            secure: this.config.cookieSecure,
        });
    }

    private async verifyToken(accessToken: string): Promise<boolean> {
        const result = await this.httpClient.request(
            `${this.httpBaseEndpoint}/verify-token`,
            {
                method: 'POST',
                body: accessToken,
            },
        );
        return !result[1];
    }

    private async getSessionId(): Promise<Result<number, Errors>> {
        let [sessionID, error] = await this.httpClient.request(
            `${this.httpBaseEndpoint}/sign-in/session/new`,
            {
                method: 'GET',
            },
        );
        if (error) {
            return [null, error];
        }
        return [parseInt(sessionID!), null];
    }

    public dispose() {
        this.channel?.close();
    }
}

function readMessage(
    messageChan: PutChannel<string | undefined>,
    errorChan: PutChannel<Errors | undefined>,
): Promise<Result<string, Errors>> {
    return select<Result<string, Errors>>([
        [
            messageChan as Channel<string | undefined>,
            async (token: string) => {
                return [token, null];
            },
        ],
        [
            errorChan as Channel<Errors | undefined>,
            async (error: Errors) => {
                return [null, error];
            },
        ],
    ]);
}
