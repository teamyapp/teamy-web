import { TaskAction } from '@core/entity/taskAction';
import { AppState } from '@core/storage/states/app.state';
import { TaskState } from '@core/storage/states/task.state';
import { TaskStatus } from '@core/storage/states/taskStatus';
import { LocalStore } from '@core/storage/syncer/localStore';

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
    'ADD_AWAIT_FOR_TASK',
    'DELETE',
    'ASSIGN_OWNER',
]);
availableActions.set('PAUSED', ['START', 'DELETE', 'ASSIGN_OWNER']);
availableActions.set('BLOCKED', []);
availableActions.set('AWAITING', [
    'ADD_AWAIT_FOR_TASK',
    'DELETE',
    'ASSIGN_OWNER',
]);
availableActions.set('DELIVERED', ['DELETE', 'ASSIGN_OWNER']);

export class Task {
    constructor(private localStore: LocalStore, private taskState: TaskState) {}

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
            this.localStore,
            this.localStore.getState().users[this.taskState.creatorUserId],
        );
    }

    public get owner(): User | undefined {
        if (!this.taskState.ownerUserId) {
            return undefined;
        }

        return new User(
            this.localStore,
            this.localStore.getState().users[this.taskState.ownerUserId],
        );
    }

    public get owningTeam(): Team {
        return new Team(
            this.localStore,
            this.localStore.getState().teams[this.taskState.owningTeamId],
        );
    }

    public get status(): TaskStatus {
        return this.taskState.status;
    }

    public get comments(): Thread {
        return new Thread(this.localStore, this.taskState.commentsThreadId);
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

    public get awaitForTasks(): Task[] {
        const appState = this.localStore.getState();
        return appState.taskAwaitForRelations
            .filter((relation) => relation.awaitingTaskId === this.taskState.id)
            .map(
                (relation) =>
                    new Task(
                        this.localStore,
                        appState.tasks[relation.awaitForTaskId],
                    ),
            );
    }
}
