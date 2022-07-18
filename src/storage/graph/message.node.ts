import { Message } from '@core/entity/message';
import { MessageState } from '@core/storage/states/message.state';
import { LocalStore } from '@core/storage/syncer/localStore';

import { ThreadNode } from './thread.node';
import { UserNode } from './user.node';

export class MessageNode implements Message {
    constructor(
        private localStore: LocalStore,
        private messageState: MessageState,
    ) {}

    public get id(): number {
        return this.messageState.id;
    }

    public get body(): string {
        return this.messageState.body;
    }

    public get author(): UserNode {
        return new UserNode(
            this.localStore,
            this.localStore.getState().users[this.messageState.authorUserId],
        );
    }

    public get thread(): ThreadNode {
        return new ThreadNode(this.localStore, this.messageState.threadId);
    }

    public get createdAt(): Date {
        return this.messageState.createdAt;
    }

    public get updatedAt(): Date | undefined {
        return this.messageState.updatedAt;
    }
}
