import Cookies from 'js-cookie';
import {Errors} from '../ext/errors';
import {Result} from '../ext/result';
import {IChannel, ISubscription} from '../network/IChannel';
import {WebSocketChannel} from '../network/WebSocketChannel';

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
    private readonly apiBaseUrl: string;
    private readonly webSocketUrl: string;
    private subscription?: ISubscription;

    constructor(apiBaseUrl: string, webSocketUrl: string) {
        this.apiBaseUrl = apiBaseUrl;
        this.webSocketUrl = webSocketUrl;
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

    public async trySignIn(): Promise<boolean> {
        let accessToken;
        while (true) {
            const clientId = this.getClientId();
            try {
                accessToken = await this.waitForAccessToken(clientId);
                break;
            } catch (e: unknown) {
                switch (e) {
                    case Errors.ClientIdInUse:
                        continue;
                    case Errors.RequestTimeOut:
                        return false;
                    default:
                        throw e;
                }
            }
        }

        IdentityClient.saveAccessToken(accessToken);
        return true;
    }

    private async waitForAccessToken(clientId: number): Promise<string> {
        const channel = await this.getChannel(clientId);
        return new Promise<string>((resolve, reject) => {
            this.subscription = channel.onMessageReceived((message: string) => {
                resolve(message);
                channel.close();
            });

            channel.onError((error: Errors) => {
                reject(error);
            });
        });
    }

    private async getChannel(clientId: number): Promise<Result<IChannel>> {
        const channel: IChannel = new WebSocketChannel(this.webSocketUrl);
        const resultPromise = channel.onMessageReceivedAsync();
        channel.open();

        const initMessage: Message = {
            type: MessageType.InitChannel,
            payload: clientId,
        };
        channel.sendMessage(JSON.stringify(initMessage));

        const [rawMessage, err] = await resultPromise;
        if (!err) {
            return [channel, err]
        }

        const message: Message = JSON.parse(rawMessage);
        if (message.type === MessageType.ChannelReady) {
            return [channel, null]
        } else {
            channel.close();
            return [channel, Errors.ClientIdInUse]
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
