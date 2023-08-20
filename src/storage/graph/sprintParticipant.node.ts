import { Duration } from '@lib/entity/duration';

import { SprintParticipant } from '@core/entity/sprintParticipant';
import { SprintNode } from '@core/storage/graph/sprint.node';
import { UserNode } from '@core/storage/graph/user.node';
import { SprintParticipantState } from '@core/storage/states/sprintParticipant.state';
import { LocalStore } from '@core/storage/syncer/localStore';

export class SprintParticipantNode implements SprintParticipant {
    constructor(
        private localStore: LocalStore,
        private sprintParticipantState: SprintParticipantState,
    ) {}

    public get sprint(): SprintNode {
        const appState = this.localStore.getState();
        const sprint = appState.sprints[this.sprintParticipantState.sprintId];
        return new SprintNode(this.localStore, sprint);
    }

    public get user(): UserNode {
        const appState = this.localStore.getState();
        const user = appState.users[this.sprintParticipantState.userId];
        return new UserNode(this.localStore, user);
    }

    public get totalBandwidth(): Duration {
        return this.sprintParticipantState.totalBandwidth;
    }

    public get unusedBandwidth(): Duration {
        return this.sprintParticipantState.unusedBandwidth;
    }

    public get createdAt(): Date {
        return this.sprintParticipantState.createdAt;
    }

    public get updatedAt(): Date | undefined {
        return this.sprintParticipantState.updatedAt;
    }
}
