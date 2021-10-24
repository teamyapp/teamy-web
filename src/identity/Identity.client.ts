import Cookies from 'js-cookie';
import { Environment } from '../env/environment';
import { Errors } from '../ext/errors';
import { Result } from '../ext/result';
import { IChannel, ISubscription } from '../network/IChannel';
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
    private subscription?: ISubscription;

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
        IdentityClient.saveAccessToken(accessToken);
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
        const channel = value!;
        return new Promise<Result<string, Errors>>((resolve) => {
            this.subscription = channel.onMessageReceived((message: string) => {
                resolve({ value: message });
                channel.close();
            });

            channel.onError((error: Errors) => {
                resolve({ error });
            });
        });
    }

    private async getChannel(
        clientId: number,
    ): Promise<Result<IChannel, Errors>> {
        const channel: IChannel = new WebSocketChannel(
            this.config.webSocketUrl,
        );
        await channel.open();

        const resultPromise = channel.onMessageReceivedAsync();
        const initMessage: Message = {
            type: MessageType.InitChannel,
            payload: clientId,
        };
        channel.sendMessage(JSON.stringify(initMessage));
        const { value, error } = await resultPromise;
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

    private static saveAccessToken(accessToken: string): void {
        Cookies.set(accessTokenKey, accessToken);
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
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
