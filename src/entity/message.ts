import { User } from './user';

export interface Message {
    id: number;
    author: User;
    content: string;
    createdAt: Date;
}
