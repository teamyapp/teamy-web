import Cookies from 'js-cookie';
import { Channel, PutChannel, select } from '../concurrency/csp';
import { Environment } from '../env/environment';
import { Errors } from '../ext/errors';
import { Result } from '../ext/result';
import { IChannel } from '../network/IChannel';
import { WebSocketChannel } from '../network/WebSocketChannel';
import { Config, getConfig } from './config';

const accessTokenKey = 'accessToken';

enum MessageType {
    ChannelReady,
    InitChannel,
}

interface Message {
    type: MessageType;
    payload: any;
}

export class IdentityClient {
    private readonly config: Config;
    private channel?: IChannel;

    constructor(env: Environment) {
        this.config = getConfig(env);
    }

    public getAccessToken(): string {
        return Cookies.get(accessTokenKey) || '';
    }

    public isSignedIn(): boolean {
        const accessToken = this.getAccessToken();
        if (accessToken == null || accessToken.length === 0) {
            return false;
        }
        return this.verifyIdentity(accessToken);
    }

    public async trySignIn(): Promise<Errors | undefined> {
        let result: Result<string, Errors>;

        while (true) {
            const clientId = this.getClientId();
            result = await this.waitForAccessToken(clientId);
            if (!result.error) {
                break;
            }

            switch (result.error as Errors) {
                case Errors.ClientIdInUse:
                    continue;
                default:
                    return result.error;
            }
        }

        const accessToken = result.value!;
        this.saveAccessToken(accessToken);
        return result.error;
    }

    private async waitForAccessToken(
        clientId: number,
    ): Promise<Result<string, Errors>> {
        const { value, error } = await this.getChannel(clientId);
        if (error) {
            return {
                error,
            };
        }
        this.channel = value!;
        return readMessage(
            this.channel.onMessageReceived(),
            this.channel.onError(),
        );
    }

    private async getChannel(
        clientId: number,
    ): Promise<Result<IChannel, Errors>> {
        const channel: IChannel = new WebSocketChannel(
            `${this.config.apiBaseUrl}/channel`,
        );
        await channel.open();

        const onMessageReceived = channel.onMessageReceived();
        const onError = channel.onError();
        const initMessage: Message = {
            type: MessageType.InitChannel,
            payload: clientId,
        };
        channel.sendMessage(JSON.stringify(initMessage));

        const { value, error } = await readMessage(onMessageReceived, onError);
        if (error) {
            return {
                error: error,
            };
        }

        const rawMessage = value!;
        const message: Message = JSON.parse(rawMessage);
        if (message.type === MessageType.ChannelReady) {
            return {
                value: channel,
            };
        } else {
            channel.close();
            return {
                error: Errors.ClientIdInUse,
            };
        }
    }

    private saveAccessToken(accessToken: string): void {
        Cookies.set(accessTokenKey, accessToken, {
            domain: this.config.cookieDomain,
            secure: this.config.cookieSecure,
        });
    }

    private verifyIdentity(accessToken: string): boolean {
        // TODO: fill in when backend is ready
        return false;
    }

    private getClientId(): number {
        // TODO: fill in when backend is ready
        return 0;
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
                return { value: token };
            },
        ],
        [
            errorChan as Channel<Errors | undefined>,
            async (error: Errors) => {
                return { error };
            },
        ],
    ]);
}
