import { Message } from '@core/entityv2/message';

export interface CreateMessageInput {
    body: string;
}

export interface UpdateMessageInput {
    body: string;
}

export class MessageClient {
    createMessage(threadId: number, message: CreateMessageInput): Promise<Message> {
        // TODO: implement me
    }

    updateMessage(messageId: number, input: UpdateMessageInput): Promise<Message> {
        // TODO: implement me
    }

    deleteMessage(messageId: number): Promise<Message> {
        // TODO: implement me
    }
}
