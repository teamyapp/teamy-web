import { PopChannel, chan, multi } from '@lib/csp/csp';
import { RealTimeCollectionClient } from '@lib/storage/RealTimeCollection.client';

import { Invitation } from '@core/statev2/invitation';

const collectionType = 'Invitation';

export class InvitationCollection {
    private readonly createInvitationCh = chan<Invitation>();
    private readonly createInvitationMulti = multi(this.createInvitationCh);
    private readonly updateInvitationCh = chan<Invitation>();
    private readonly updateInvitationMulti = multi(this.updateInvitationCh);
    private readonly deleteInvitationCh = chan<number>();
    private readonly deleteInvitationMulti = multi(this.deleteInvitationCh);

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
                        this.createInvitationCh
                            .put(Invitation.fromAttributes(mutation.attributes))
                            .then();
                        break;
                    }
                    case 'UPDATE': {
                        this.updateInvitationCh
                            .put(Invitation.fromAttributes(mutation.attributes))
                            .then();
                        break;
                    }
                    case 'DELETE': {
                        this.deleteInvitationCh
                            .put(parseInt(mutation.attributes.ID))
                            .then();
                        break;
                    }
                }
            }
        })();
    }

    subscribeCreateInvitation(): PopChannel<Invitation | undefined> {
        return this.createInvitationMulti.copy();
    }

    subscribeUpdateInvitation(): PopChannel<Invitation | undefined> {
        return this.updateInvitationMulti.copy();
    }

    subscribeDeleteInvitation(): PopChannel<number | undefined> {
        return this.deleteInvitationMulti.copy();
    }
}
