import { TaskAction } from '@core/entity/taskAction';
import { AppState } from '@core/storage/states/app.state';
import { TaskState } from '@core/storage/states/task.state';
import { TaskStatus } from '@core/storage/states/taskStatus';

import { Team } from './team';
import { Thread } from './thread';
import { User } from './user';

const availableActions: Map<TaskStatus, TaskAction[]> = new Map<
    TaskStatus,
    TaskAction[]
>();
availableActions.set('UPCOMING', ['START', 'DELETE', 'ASSIGN_OWNER']);
availableActions.set('IN_PROGRESS', [
    'MARK_COMPLETE',
    'REPORT_BLOCKED',
    'ASSIGN_OWNER',
    'DELETE',
]);
availableActions.set('PAUSED', ['START', 'DELETE', 'ASSIGN_OWNER']);
availableActions.set('BLOCKED', []);
availableActions.set('AWAITING', ['DELETE', 'ASSIGN_OWNER']);
availableActions.set('DELIVERED', ['DELETE', 'ASSIGN_OWNER']);

export class Task {
    constructor(private appState: AppState, private taskState: TaskState) {}

    public get id(): number {
        return this.taskState.id;
    }

    public get goal(): string {
        return this.taskState.goal;
    }

    public get context(): string | undefined {
        return this.taskState.context;
    }

    public get creator(): User {
        return new User(
            this.appState,
            this.appState.users[this.taskState.creatorUserId],
        );
    }

    public get owner(): User | undefined {
        if (!this.taskState.ownerUserId) {
            return undefined;
        }

        return new User(
            this.appState,
            this.appState.users[this.taskState.ownerUserId],
        );
    }

    public get owningTeam(): Team {
        return new Team(
            this.appState,
            this.appState.teams[this.taskState.owningTeamId],
        );
    }

    public get status(): TaskStatus {
        return this.taskState.status;
    }

    public get comments(): Thread {
        return new Thread(this.appState, this.taskState.commentsThreadId);
    }

    public get createdAt(): Date {
        return this.taskState.createdAt;
    }

    public get updatedAt(): Date | undefined {
        return this.taskState.updatedAt;
    }

    public get dueAt(): Date | undefined {
        return this.taskState.dueAt;
    }

    public get effort(): number | undefined {
        return this.taskState.effort;
    }

    public get availableActions(): TaskAction[] {
        return availableActions.get(this.taskState.status) || [];
    }
}
