import { Errors } from '../ext/errors';
import { Result } from '../ext/result';

export interface OnMessageReceived {
    (message: string): void;
}

export interface OnError {
    (error: Errors): void;
}

export interface ISubscription {
    notify(data: any): void;
    unsubscribe(): void;
}

export interface IChannel {
    open(): Promise<void>;
    close(): void;
    sendMessage(message: string): void;
    onMessageReceived(callback: OnMessageReceived): ISubscription;
    onMessageReceivedAsync(): Promise<Result<string, Errors>>;
    onError(callback: OnError): ISubscription;
}
