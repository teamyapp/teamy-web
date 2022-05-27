import { Message } from './message';

export interface Thread {
    id: number;
    messages: Message[]
}
