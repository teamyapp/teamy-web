import {Errors} from '../ext/errors';
import {Result} from '../ext/result';
import {IChannel, ISubscription, OnError, OnMessageReceived} from './IChannel';

interface ISubscriptions {
    [id: number]: ISubscription;
}

export class WebSocketChannel implements IChannel {
    private readonly connectionUrl: string;
    private webSocket?: WebSocket;

    private nextOnErrorSubscriptionId = 0;
    private nextOnMessageSubscriptionId = 0;

    private onErrorSubscriptions: ISubscriptions = {};
    private onMessageSubscriptions: ISubscriptions = {};

    constructor(connectionUrl: string) {
        this.connectionUrl = connectionUrl;
    }

    public close(): void {
        this.webSocket?.close();
    }

    public onError(callback: OnError): ISubscription {
        return this.subscribe(
            this.nextOnErrorSubscriptionId,
            this.onErrorSubscriptions,
            () => {
                this.nextOnErrorSubscriptionId++;
            },
            (data: any) => {
                // TODO: convert Web Socket error to Errors
                callback(data);
            }
        );
    }

    public onMessageReceived(callback: OnMessageReceived): ISubscription {
        return this.subscribe(
            this.nextOnMessageSubscriptionId,
            this.onMessageSubscriptions,
            () => {
                this.nextOnMessageSubscriptionId++;
            },
            (data: any) => {
                callback(data);
            }
        );
    }

    public onMessageReceivedAsync(): Promise<Result<string>> {
        return new Promise<Result<string>>((resolve) => {
            const messageSubscription = this.onMessageReceived((message: string) => {
                resolve([message, null]);
                messageSubscription.unsubscribe();
            });
            const errorSubscription = this.onError((error: Errors) => {
                resolve(['', error]);
                errorSubscription.unsubscribe();
            });
        });
    }

    public open(): Promise<void> {
        const webSocket = new WebSocket(this.connectionUrl);
        return new Promise((resolve, reject) => {
            webSocket.onopen = (event: Event) => {
                console.log(
                    `WebSocket connected to: ${
                        this.connectionUrl
                    } ${JSON.stringify(event)}`
                );
                resolve();
                this.webSocket = webSocket;
            };
            webSocket.onerror = (event: Event) => {
                for (const id in this.onErrorSubscriptions) {
                    this.onErrorSubscriptions[id].notify(event);
                }
            };
            webSocket.onmessage = (event: MessageEvent) => {
                for (const id in this.onMessageSubscriptions) {
                    this.onMessageSubscriptions[id].notify(event.data);
                }
            };
        });
    }

    public sendMessage(message: string): void {
        this.webSocket?.send(message);
    }

    private subscribe(
        nextSubscriptionId: number,
        subscriptions: ISubscriptions,
        incrementSubscriptionId: () => void,
        callback: (data: any) => void
    ): Subscription {
        const subscription = new Subscription(
            (error: any) => {
                callback(error);
            },
            () => {
                delete subscriptions[nextSubscriptionId];
            }
        );
        incrementSubscriptionId();
        subscriptions[nextSubscriptionId] = subscription;
        return subscription;
    }
}

class Subscription implements ISubscription {
    private readonly notifyCallback: (data: any) => void;
    private readonly cleanUpCallback: () => void;

    constructor(
        notifyCallback: (data: any) => void,
        cleanUpCallback: () => void
    ) {
        this.notifyCallback = notifyCallback;
        this.cleanUpCallback = cleanUpCallback;
    }

    public unsubscribe(): void {
        this.cleanUpCallback();
    }

    public notify(data: any): void {
        this.notifyCallback(data);
    }
}
