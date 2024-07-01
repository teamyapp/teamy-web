import { Thread } from '@core/entity/thread';
import { LocalStore } from '@core/storage/syncer/localStore';

import { MessageNode } from './message.node';

export class ThreadNode implements Thread {
    constructor(
        private localStore: LocalStore,
        private threadId: number,
    ) {}

    public get id(): number {
        return this.threadId;
    }

    public get messages(): MessageNode[] {
        const appState = this.localStore.getState();
        const messages: MessageNode[] = [];
        for (let messageId in appState.messages) {
            const messageState = appState.messages[messageId];
            if (messageState.threadId === this.threadId) {
                messages.push(new MessageNode(this.localStore, messageState));
            }
        }

        return messages;
    }
}
