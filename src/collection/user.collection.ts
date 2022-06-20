import { PopChannel, chan, multi } from '@lib/csp/csp';
import { RealTimeCollectionClient } from '@lib/storage/RealTimeCollection.client';

import { User } from '@core/statev2/user';

const collectionType = 'User';

export class UserCollection {
    private readonly createUserCh = chan<User>();
    private readonly createUserMulti = multi(this.createUserCh);
    private readonly updateUserCh = chan<User>();
    private readonly updateUserMulti = multi(this.updateUserCh);
    private readonly deleteUserCh = chan<number>();
    private readonly deleteUserMulti = multi(this.deleteUserCh);

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
                        this.createUserCh
                            .put(User.fromAttributes(mutation.attributes))
                            .then();
                        break;
                    }
                    case 'UPDATE': {
                        this.updateUserCh
                            .put(User.fromAttributes(mutation.attributes))
                            .then();
                        break;
                    }
                    case 'DELETE': {
                        this.deleteUserCh
                            .put(parseInt(mutation.attributes.ID))
                            .then();
                        break;
                    }
                }
            }
        })();
    }

    subscribeCreateUser(): PopChannel<User | undefined> {
        return this.createUserMulti.copy();
    }

    subscribeUpdateUser(): PopChannel<User | undefined> {
        return this.updateUserMulti.copy();
    }

    subscribeDeleteUser(): PopChannel<number | undefined> {
        return this.deleteUserMulti.copy();
    }
}
