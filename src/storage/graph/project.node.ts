import {Project} from "@core/entity/project";
import { LocalStore } from "../syncer/localStore";
import { ProjectState } from "../states/project.state";
import { UserNode } from "./user.node";
import { PhaseNode } from "./phase.node";
import { StoryNode } from "./story.node";

export class ProjectNode implements Project {
    constructor(
        private localStore: LocalStore,
        private project: ProjectState,
    ) {}

    get id(): number {
        return this.project.id;
    }

    get name(): string {
        return this.project.name;
    }

    get expectedStartAt(): Date {
        return this.project.expectedStartAt;
    }

    get expectedEndAt(): Date {
        return this.project.expectedEndAt;
    }

    get actualStartAt(): Date | undefined {
        return this.project.actualStartAt;
    }

    get actualEndAt(): Date | undefined {
        return this.project.actualEndAt;
    }

    get creator(): UserNode {
        return new UserNode(
            this.localStore,
            this.localStore.getState().users[this.project.creatorId],
        );
    }

    get createdAt(): Date {
        return this.project.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.project.updatedAt;
    }

    get phases(): PhaseNode[] {
        const state = this.localStore.getState();

        return state.projectPhaseRelations
            .filter((relation) => relation.projectId === this.project.id)
            .map((relation) => {
                const phaseState = state.phases[relation.phaseId];
                if (!phaseState) {
                    throw new Error(`Phase not found: ${relation.phaseId}`);
                }
                return new PhaseNode(this.localStore, phaseState);
            });
    }

    get stories(): StoryNode[] {
        const state = this.localStore.getState();

        return state.projectStoryRelations
            .filter((relation) => relation.projectId === this.project.id)
            .map((relation) => {
                const storyState = state.stories[relation.storyId];
                if (!storyState) {
                    throw new Error(`Story not found: ${relation.storyId}`);
                }
                return new StoryNode(this.localStore, storyState);
            });
    }

    get totalPhases(): number {
        return this.phases.length;
    }

    get deliveredPhases(): number {
        return this.phases.filter((phase) => phase.status === 'COMPLETED').length;
    }
}