import { Thread } from './thread';
import { User } from './user';

export interface Message {
    id: number;
    body: string;
    author: User;
    thread: Thread;
    createdAt: Date;
    updatedAt: Date;
}
