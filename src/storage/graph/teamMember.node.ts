import { Duration } from '@lib/entity/duration';

import { TeamMember } from '@core/entity/teamMember';
import { TeamNode } from '@core/storage/graph/team.node';
import { UserNode } from '@core/storage/graph/user.node';
import { TeamMemberState } from '@core/storage/states/teamMember.state';
import { LocalStore } from '@core/storage/syncer/localStore';

export class TeamMemberNode implements TeamMember {
    constructor(
        private localStore: LocalStore,
        private teamMemberState: TeamMemberState,
    ) {}

    get team(): TeamNode {
        const appState = this.localStore.getState();
        const teamState = appState.teams[this.teamMemberState.teamId];
        return new TeamNode(this.localStore, teamState);
    }

    get user(): UserNode {
        const appState = this.localStore.getState();
        const userState = appState.users[this.teamMemberState.userId];
        return new UserNode(this.localStore, userState);
    }

    get weeklyBandwidth(): Duration {
        return this.teamMemberState.weeklyBandwidth;
    }

    get createdAt(): Date {
        return this.teamMemberState.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.teamMemberState.updatedAt;
    }
}
