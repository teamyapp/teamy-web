import { Task } from '@core/entity/task';
import { TaskAction } from '@core/entity/taskAction';
import { TaskState } from '@core/storage/states/task.state';
import { TaskStatus } from '@core/storage/states/taskStatus';
import { LocalStore } from '@core/storage/syncer/localStore';

import { TeamNode } from './team.node';
import { ThreadNode } from './thread.node';
import { UserNode } from './user.node';

const availableActions: Record<TaskStatus, TaskAction[]> = {
    UPCOMING: ['START', 'DELETE', 'ASSIGN_OWNER'],
    IN_PROGRESS: [
        'MARK_COMPLETE',
        'REPORT_BLOCKED',
        'ADD_AWAIT_FOR_TASK',
        'DELETE',
        'ASSIGN_OWNER',
    ],
    PAUSED: ['START', 'DELETE', 'ASSIGN_OWNER'],
    BLOCKED: [],
    AWAITING: ['ADD_AWAIT_FOR_TASK', 'DELETE', 'ASSIGN_OWNER'],
    DELIVERED: ['DELETE', 'ASSIGN_OWNER'],
};

export class TaskNode implements Task {
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

    public get creator(): UserNode {
        return new UserNode(
            this.localStore,
            this.localStore.getState().users[this.taskState.creatorUserId],
        );
    }

    public get owner(): UserNode | undefined {
        if (!this.taskState.ownerUserId) {
            return undefined;
        }

        return new UserNode(
            this.localStore,
            this.localStore.getState().users[this.taskState.ownerUserId],
        );
    }

    public get owningTeam(): TeamNode {
        return new TeamNode(
            this.localStore,
            this.localStore.getState().teams[this.taskState.owningTeamId],
        );
    }

    public get status(): TaskStatus {
        return this.taskState.status;
    }

    public get isPlanned(): boolean {
        return this.taskState.isPlanned;
    }

    public get comments(): ThreadNode {
        return new ThreadNode(this.localStore, this.taskState.commentsThreadId);
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
        return availableActions[this.taskState.status];
    }

    public get awaitForTasks(): TaskNode[] {
        const appState = this.localStore.getState();
        return appState.taskAwaitForRelations
            .filter((relation) => relation.awaitingTaskId === this.taskState.id)
            .map(
                (relation) =>
                    new TaskNode(
                        this.localStore,
                        appState.tasks[relation.awaitForTaskId],
                    ),
            );
    }
}
