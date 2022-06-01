import { AppState } from '@core/statev2/app.state';
import { ThreadState } from '@core/statev2/thread.state';

import { Message } from './message';

export class Thread {
    constructor(private appState: AppState, private threadState: ThreadState) {}

    get id(): number {
        return this.threadState.id;
    }

    get messages(): Message[] {
        return this.threadState.messageIds?.map(
            (messageId: number) =>
                new Message(this.appState, this.appState.messages[messageId]),
        );
    }
}
