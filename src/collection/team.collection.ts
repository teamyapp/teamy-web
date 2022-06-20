import { PopChannel, chan, multi } from '@lib/csp/csp';
import { RealTimeCollectionClient } from '@lib/storage/RealTimeCollection.client';

import { Team } from '@core/statev2/team';

const collectionType = 'Team';

export class TeamCollection {
    private readonly createTeamCh = chan<Team>();
    private readonly createTeamMulti = multi(this.createTeamCh);
    private readonly updateTeamCh = chan<Team>();
    private readonly updateTeamMulti = multi(this.updateTeamCh);
    private readonly deleteTeamCh = chan<number>();
    private readonly deleteTeamMulti = multi(this.deleteTeamCh);

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
                        this.createTeamCh
                            .put(Team.fromAttributes(mutation.attributes))
                            .then();
                        break;
                    }
                    case 'UPDATE': {
                        this.updateTeamCh
                            .put(Team.fromAttributes(mutation.attributes))
                            .then();
                        break;
                    }
                    case 'DELETE': {
                        this.deleteTeamCh
                            .put(parseInt(mutation.attributes.ID))
                            .then();
                        break;
                    }
                }
            }
        })();
    }

    subscribeCreateTeam(): PopChannel<Team | undefined> {
        return this.createTeamMulti.copy();
    }

    subscribeUpdateTeam(): PopChannel<Team | undefined> {
        return this.updateTeamMulti.copy();
    }

    subscribeDeleteTeam(): PopChannel<number | undefined> {
        return this.deleteTeamMulti.copy();
    }
}
