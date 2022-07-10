import { PopChannel, PutChannel, chan, multi } from '@lib/csp/csp';
import { Connection, ConnectionError } from '@lib/network/Connection';

export class WebSocketConnection implements Connection {
    private webSocket?: WebSocket;

    private messageReceivedChan = chan<string>();
    private messageReceivedMulti = multi<string>(this.messageReceivedChan);
    private errorChan = chan<ConnectionError>();
    private errorMulti = multi<ConnectionError>(this.errorChan);

    constructor(
        private readonly connectionUrl: string,
        private readonly getAccessToken?: ()=>string,
    ) {}

    private _isConnected = false;

    public get isConnected() {
        return this._isConnected;
    }

    public connect(): Promise<void> {
        const url = new URL(this.connectionUrl);
        url.searchParams.set(
            'accessToken',
            this.getAccessToken?.call(null) || '',
        );
        const webSocket = new WebSocket(url);
        return new Promise((resolve, reject) => {
            webSocket.onopen = (event: Event) => {
                console.log(
                    `WebSocket connected to: ${
                        this.connectionUrl
                    } ${JSON.stringify(event)}`,
                );
                this.webSocket = webSocket;
                this._isConnected = true;
                resolve();
            };
            webSocket.onerror = (event: Event) => {
                this._isConnected = false;
                console.error('WebSocket error:', event);
                this.errorChan.put(getError(event));
            };
            webSocket.onmessage = (event: MessageEvent) => {
                this.messageReceivedChan.put(event.data);
            };
        });
    }

    public close(): void {
        this.webSocket?.close();
        this.messageReceivedChan.close();
        this.errorChan.close();
    }

    public onErrors(): PutChannel<ConnectionError | undefined> {
        return this.errorMulti.copy();
    }

    public onMessageReceived(): PopChannel<string | undefined> {
        return this.messageReceivedMulti.copy();
    }

    public sendMessage(message: string): void {
        this.webSocket?.send(message);
    }
}

function getError(event: Event): ConnectionError {
    return 'Unknown';
}
