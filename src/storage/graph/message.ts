import { AppState } from '@core/storage/states/app.state';
import { MessageState } from '@core/storage/states/message.state';

import { Thread } from './thread';
import { User } from './user';

export class Message {
    constructor(
        private appState: AppState,
        private messageState: MessageState,
    ) {}

    public get id(): number {
        return this.messageState.id;
    }

    public get body(): string {
        return this.messageState.body;
    }

    public get author(): User {
        return new User(
            this.appState,
            this.appState.users[this.messageState.authorUserId],
        );
    }

    public get thread(): Thread {
        return new Thread(this.appState, this.messageState.threadId);
    }

    public get createdAt(): Date {
        return this.messageState.createdAt;
    }

    public get updatedAt(): Date | undefined {
        return this.messageState.updatedAt;
    }
}
