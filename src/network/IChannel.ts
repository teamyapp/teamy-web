import { Channel } from '../concurrency/csp';
import { Errors } from '../ext/errors';

export interface IChannel {
    open(): Promise<void>;
    close(): void;
    sendMessage(message: string): void;

    // TODO: change channel to pop channel (need code change in concurrency library)
    onMessageReceived(): Channel<string | undefined>;

    // TODO: change channel to pop channel (need code change in concurrency library)
    onError(): Channel<Errors | undefined>;
}
