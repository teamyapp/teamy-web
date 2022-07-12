import { AppState } from '@core/storage/states/app.state';
import { LocalStore } from '@core/storage/syncer/localStore';

import { Message } from './message';

export class Thread {
    constructor(private localStore: LocalStore, private threadId: number) {}

    public get id(): number {
        return this.threadId;
    }

    public get messages(): Message[] {
        const appState = this.localStore.getState();
        const messages: Message[] = [];
        for (let messageId in appState.messages) {
            const messageState = appState.messages[messageId];
            if (messageState.threadId === this.threadId) {
                messages.push(new Message(this.localStore, messageState));
            }
        }

        return messages;
    }
}
