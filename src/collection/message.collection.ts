import { PopChannel, chan, multi } from '@lib/csp/csp';
import { RealTimeCollectionClient } from '@lib/storage/RealTimeCollection.client';

import { Message } from '@core/statev2/message';

const collectionType = 'Message';

export class MessageCollection {
    private readonly createMessageCh = chan<Message>();
    private readonly createMessageMulti = multi(this.createMessageCh);
    private readonly updateMessageCh = chan<Message>();
    private readonly updateMessageMulti = multi(this.updateMessageCh);
    private readonly deleteMessageCh = chan<number>();
    private readonly deleteMessageMulti = multi(this.deleteMessageCh);

    constructor(
        private readonly realTimeCollectionClient: RealTimeCollectionClient,
    ) {}

    sync() {
        const mutationsCh = this.realTimeCollectionClient.subscribeMutations();
        (async () => {
            while (true) {
                const mutation = await mutationsCh.pop();
                if (mutation === undefined) {
                    return;
                }

                if (mutation.collectionType !== collectionType) {
                    continue;
                }

                switch (mutation.mutationType) {
                    case 'CREATE': {
                        this.createMessageCh
                            .put(Message.fromAttributes(mutation.attributes))
                            .then();
                        break;
                    }
                    case 'UPDATE': {
                        this.updateMessageCh
                            .put(Message.fromAttributes(mutation.attributes))
                            .then();
                        break;
                    }
                    case 'DELETE': {
                        this.deleteMessageCh
                            .put(parseInt(mutation.attributes.ID))
                            .then();
                        break;
                    }
                }
            }
        })();
    }

    subscribeCreateMessage(): PopChannel<Message | undefined> {
        return this.createMessageMulti.copy();
    }

    subscribeUpdateMessage(): PopChannel<Message | undefined> {
        return this.updateMessageMulti.copy();
    }

    subscribeDeleteMessage(): PopChannel<number | undefined> {
        return this.deleteMessageMulti.copy();
    }
}
