import { chan, multi, PutChannel } from '@lib/csp/csp';
import { Errors } from '@lib/error/errors';

import { IChannel } from './IChannel';

export class WebSocketChannel implements IChannel {
    private readonly connectionUrl: string;
    private webSocket?: WebSocket;

    private messageReceivedChan = chan<string>();
    private messageReceivedMulti = multi<string>(this.messageReceivedChan);

    private errorChan = chan<Errors>();
    private errorMulti = multi<Errors>(this.errorChan);

    constructor(connectionUrl: string) {
        this.connectionUrl = connectionUrl;
    }

    public close(): void {
        this.webSocket?.close();
        this.messageReceivedChan.close();
        this.errorChan.close();
    }

    public onError(): PutChannel<Errors | undefined> {
        return this.errorMulti.copy();
    }

    public onMessageReceived(): PutChannel<string | undefined> {
        return this.messageReceivedMulti.copy();
    }

    public open(): Promise<void> {
        const webSocket = new WebSocket(this.connectionUrl);
        return new Promise((resolve, reject) => {
            webSocket.onopen = (event: Event) => {
                console.log(
                    `WebSocket connected to: ${
                        this.connectionUrl
                    } ${JSON.stringify(event)}`,
                );
                resolve();
                this.webSocket = webSocket;
            };
            webSocket.onerror = (event: Event) => {
                this.errorChan.put(getError(event));
            };
            webSocket.onmessage = (event: MessageEvent) => {
                this.messageReceivedChan.put(event.data);
            };
        });
    }

    public sendMessage(message: string): void {
        this.webSocket?.send(message);
    }
}

function getError(event: Event): Errors {
    // TODO: extract the correct error from the event
    return Errors.Unknown;
}
