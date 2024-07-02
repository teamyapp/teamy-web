import { Priority } from '@core/entity/priority';
import { Story, StoryStatus } from '@core/entity/story';
import { Task } from '@core/entity/task';
import { User } from '@core/entity/user';

import { StoryState } from '../states/story.state';
import { LocalStore } from '../syncer/localStore';
import { TaskNode } from './task.node';
import { UserNode } from './user.node';

export class StoryNode implements Story {
    constructor(
        private localStore: LocalStore,
        private story: StoryState,
    ) {}

    get id(): number {
        return this.story.id;
    }

    get name(): string {
        return this.story.name;
    }

    get owner(): User | undefined {
        if (!this.story.ownerId) {
            return undefined;
        }

        return new UserNode(
            this.localStore,
            this.localStore.getState().users[this.story.ownerId],
        );
    }

    get status(): StoryStatus {
        return this.story.status;
    }

    get priority(): Priority | undefined {
        return this.story.priority;
    }

    get creator(): User {
        return new UserNode(
            this.localStore,
            this.localStore.getState().users[this.story.creatorId],
        );
    }

    get createdAt(): Date {
        return this.story.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.story.updatedAt;
    }

    get tasks(): Task[] {
        const state = this.localStore.getState();

        return state.storyTaskRelations
            .filter((relation) => relation.storyId === this.story.id)
            .map((relation) => {
                const taskState = state.tasks[relation.taskId];
                if (!taskState) {
                    return null;
                }

                return new TaskNode(
                    this.localStore,
                    state.tasks[relation.taskId],
                );
            })
            .filter((task) => task !== null) as Task[];
    }

    get totalTasks(): number {
        return this.tasks.length;
    }

    get completedTasks(): number {
        return this.tasks.filter((task) => task.status === 'DELIVERED').length;
    }

    get isPlanned(): boolean {
        return this.story.isPlanned;
    }
}
