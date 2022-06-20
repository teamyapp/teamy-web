import { PopChannel, chan, multi } from '@lib/csp/csp';
import { RealTimeCollectionClient } from '@lib/storage/RealTimeCollection.client';

import { TeamMember } from '@core/statev2/teamMember';

const collectionType = 'TeamMember';

export class TeamMemberCollection {
    private readonly createTeamMemberCh = chan<TeamMember>();
    private readonly createTeamMemberMulti = multi(this.createTeamMemberCh);
    private readonly updateTeamMemberCh = chan<TeamMember>();
    private readonly updateTeamMemberMulti = multi(this.updateTeamMemberCh);
    private readonly deleteTeamMemberCh = chan<TeamMember>();
    private readonly deleteTeamMemberMulti = multi(this.deleteTeamMemberCh);

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
                        this.createTeamMemberCh
                            .put(TeamMember.fromAttributes(mutation.attributes))
                            .then();
                        break;
                    }
                    case 'UPDATE': {
                        this.updateTeamMemberCh
                            .put(TeamMember.fromAttributes(mutation.attributes))
                            .then();
                        break;
                    }
                    case 'DELETE': {
                        this.deleteTeamMemberCh
                            .put(TeamMember.fromAttributes(mutation.attributes))
                            .then();
                        break;
                    }
                }
            }
        })();
    }

    subscribeCreateTeamMember(): PopChannel<TeamMember | undefined> {
        return this.createTeamMemberMulti.copy();
    }

    subscribeUpdateTeamMember(): PopChannel<TeamMember | undefined> {
        return this.updateTeamMemberMulti.copy();
    }

    subscribeDeleteTeamMember(): PopChannel<TeamMember | undefined> {
        return this.deleteTeamMemberMulti.copy();
    }
}
