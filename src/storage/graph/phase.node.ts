import { Phase } from '@core/entity/phase';

import { PhaseState, PhaseStatus } from '../states/phase.state';
import { LocalStore } from '../syncer/localStore';
import { StoryNode } from './story.node';
import { UserNode } from './user.node';

export class PhaseNode implements Phase {
    constructor(private localStore: LocalStore, private phase: PhaseState) {}

    get id(): number {
        return this.phase.id;
    }

    get name(): string {
        return this.phase.name;
    }

    get expectedStartAt(): Date {
        return this.phase.expectedStartAt;
    }

    get expectedEndAt(): Date {
        return this.phase.expectedEndAt;
    }

    get actualStartAt(): Date | undefined {
        return this.phase.actualStartAt;
    }

    get actualEndAt(): Date | undefined {
        return this.phase.actualEndAt;
    }

    get status(): PhaseStatus {
        return this.phase.status;
    }

    get creator(): UserNode {
        return new UserNode(
            this.localStore,
            this.localStore.getState().users[this.phase.creatorId],
        );
    }

    get createdAt(): Date {
        return this.phase.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.phase.updatedAt;
    }

    get stories(): StoryNode[] {
        const state = this.localStore.getState();
        return state.phaseStoryRelations
            .filter((relation) => relation.phaseId === this.phase.id)
            .map((relation) => {
                const storyState = state.stories[relation.storyId];
                return new StoryNode(this.localStore, storyState);
            });
    }

    get totalStories(): number {
        return this.stories.length;
    }

    get deliveredStories(): number {
        return this.stories.filter((story) => story.status === 'COMPLETED')
            .length;
    }
}
