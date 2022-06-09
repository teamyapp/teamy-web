export interface MessageState {
    id: number;
    body: string;
    authorUserId: number;
    threadId: number;
    createdAt: Date;
    updatedAt?: Date;
}

export function parseMessageState(messageStateJSON: any): MessageState {
    return {
        id: messageStateJSON.id,
        body: messageStateJSON.body,
        authorUserId: messageStateJSON.authorUserId,
        threadId: messageStateJSON.threadId,
        createdAt: new Date(messageStateJSON.createdAt),
        updatedAt: messageStateJSON.updatedAt
            ? new Date(messageStateJSON.updatedAt)
            : messageStateJSON.updatedAt,
    };
}
