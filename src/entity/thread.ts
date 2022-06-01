import { Message } from '@core/entity/message';

export interface Thread {
    id: number;
    messages: Message[];
}
