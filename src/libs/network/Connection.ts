import { PopChannel, PutChannel } from '@lib/csp/csp';

export type ConnectionError = 'Unknown';

export interface Connection {
    connect(): Promise<void>;

    get isConnected(): boolean;

    close(): void;

    sendMessage(message: string): void;

    onMessageReceived(): PopChannel<string | undefined>;

    onErrors(): PutChannel<ConnectionError | undefined>;
}
