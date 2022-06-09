export interface ThreadState {
    id: number;
    messageIds: number[];
}

export function parseThreadState(threadStateJSON: any): ThreadState {
    return {
        id: threadStateJSON.id,
        messageIds: threadStateJSON.messageIds,
    };
}
