import { PutChannel } from '@lib/csp/csp';
import { Errors } from '@lib/error/errors';

export interface IChannel {
    open(): Promise<void>;

    close(): void;

    sendMessage(message: string): void;

    onMessageReceived(): PutChannel<string | undefined>;

    onError(): PutChannel<Errors | undefined>;
}
