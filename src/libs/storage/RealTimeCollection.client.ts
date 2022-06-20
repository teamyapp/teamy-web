import { PopChannel, chan, multi } from '@lib/csp/csp';
import { Connection } from '@lib/network/Connection';
import { WebSocketConnection } from '@lib/network/WebSocket.connection';

import { Mutation } from './mutation';

type InitialMessage = ClientIdMessage;

interface ClientIdMessage {
    Type: 'CLIENT_ID';
    Payload: {
        ClientID: number;
    };
}

export class RealTimeCollectionClient {
    private connection: Connection;
    private clientId?: number;
    private onMutationReceivedCh = chan<Mutation>();
    private onMutationReceivedMulti = multi(this.onMutationReceivedCh);

    constructor(private apiBaseUrl: string, webSocketUrl: string) {
        this.connection = new WebSocketConnection(
            `${webSocketUrl}/real-time-collections/clients/connect`,
        );
    }

    public async connect() {
        if (this.connection.isConnected) {
            return;
        }

        const messageReceivedCh = this.connection.onMessageReceived();
        await this.connection.connect();
        const messageJson = await messageReceivedCh.pop();
        if (messageJson === undefined) {
            return;
        }

        const message: InitialMessage = JSON.parse(messageJson);
        switch (message.Type) {
            case 'CLIENT_ID': {
                this.clientId = message.Payload.ClientID;
                console.log(`Received client ID: ${this.clientId}`);
                this.processIncomingMutations();
                break;
            }
            default: {
                console.log(
                    `Expect receive CLIENT_ID message: message=${message}`,
                );
            }
        }
    }

    public async close() {
        this.clientId = undefined;
        this.connection.close();
        this.onMutationReceivedCh.close();
    }

    public subscribeMutations(): PopChannel<Mutation | undefined> {
        return this.onMutationReceivedMulti.copy();
    }

    private processIncomingMutations() {
        const messageReceivedCh = this.connection.onMessageReceived();
        (async () => {
            while (true) {
                const messageJson = await messageReceivedCh.pop();
                if (messageJson === undefined) {
                    return;
                }

                const mutation = Mutation.fromJson(JSON.parse(messageJson));
                this.onMutationReceivedCh.put(mutation);
            }
        })();
    }
}
