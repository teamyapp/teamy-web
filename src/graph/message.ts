import { AppState } from '@core/state/app.state';
import { MessageState } from '@core/state/message.state';

import { Thread } from './thread';
import { User } from './user';

export class Message {
    constructor(
        private appState: AppState,
        private messageState: MessageState,
    ) {}

    get id(): number {
        return this.messageState.id;
    }

    get body(): string {
        return this.messageState.body;
    }

    get author(): User {
        return new User(
            this.appState,
            this.appState.users[this.messageState.authorUserId],
        );
    }

    get thread(): Thread {
        return new Thread(
            this.appState,
            this.appState.threads[this.messageState.threadId],
        );
    }

    get createdAt(): Date {
        return this.messageState.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.messageState.updatedAt;
    }
}
