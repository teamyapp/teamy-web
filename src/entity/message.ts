import { User } from './user';

export interface Message {
    id: number;
    author: User;
    body: string;
    createdAt: Date;
}
