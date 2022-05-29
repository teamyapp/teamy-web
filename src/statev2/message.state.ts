export interface MessageState {
    id: number;
    body: string;
    authorUserId: number;
    threadId: number;
    createdAt: Date;
    updatedAt?: Date;
}
