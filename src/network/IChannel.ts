import { PutChannel } from '@creatcodebuild/csp';
import { Errors } from '../ext/errors';

export interface IChannel {
    open(): Promise<void>;
    close(): void;
    sendMessage(message: string): void;
    onMessageReceived(): PutChannel<string | undefined>;
    onError(): PutChannel<Errors | undefined>;
}
