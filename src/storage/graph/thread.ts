import { AppState } from '@core/storage/states/app.state';

import { Message } from './message';

export class Thread {
    constructor(private appState: AppState, private threadId: number) {}

    public get id(): number {
        return this.threadId;
    }

    public get messages(): Message[] {
        const messages: Message[] = [];
        for (let messageId in this.appState.messages) {
            const messageState = this.appState.messages[messageId];
            if (messageState.threadId === this.threadId) {
                messages.push(new Message(this.appState, messageState));
            }
        }

        return messages;
    }
}
