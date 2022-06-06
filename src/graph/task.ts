import { AppState } from '@core/state/app.state';
import { TaskState } from '@core/state/task.state';
import { TaskAction } from '@core/state/taskAction';
import { TaskStatus } from '@core/state/taskStatus';

import { Team } from './team';
import { Thread } from './thread';
import { User } from './user';

export class Task {
    constructor(private appState: AppState, private taskState: TaskState) {}

    get id(): number {
        return this.taskState.id;
    }

    get goal(): string {
        return this.taskState.goal;
    }

    get context(): string | undefined {
        return this.taskState.context;
    }

    get creator(): User {
        return new User(
            this.appState,
            this.appState.users[this.taskState.creatorUserId],
        );
    }

    get owner(): User | undefined {
        if (!this.taskState.ownerUserId) {
            return undefined;
        }

        return new User(
            this.appState,
            this.appState.users[this.taskState.ownerUserId],
        );
    }

    get owningTeam(): Team {
        return new Team(
            this.appState,
            this.appState.teams[this.taskState.owningTeamId],
        );
    }

    get status(): TaskStatus {
        return this.taskState.status;
    }

    get comments(): Thread {
        return new Thread(
            this.appState,
            this.appState.threads[this.taskState.commentsThreadId],
        );
    }

    get createdAt(): Date {
        return this.taskState.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.taskState.updatedAt;
    }

    get dueAt(): Date | undefined {
        return this.taskState.dueAt;
    }

    get effort(): number | undefined {
        return this.taskState.effort;
    }

    get availableActions(): TaskAction[] {
        return this.taskState.availableActions;
    }
}
