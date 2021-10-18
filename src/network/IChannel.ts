import { Errors } from '../errors/errors';

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
    open(): void;
    close(): void;
    sendMessage(message: string): void;
    onMessageReceived(callback: OnMessageReceived): ISubscription;
    onError(callback: OnError): ISubscription;
}
