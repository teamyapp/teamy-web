import { Sprint } from '@core/entity/sprint';
import { TaskNode } from '@core/storage/graph/task.node';
import { TeamNode } from '@core/storage/graph/team.node';
import { SprintState } from '@core/storage/states/sprint.state';
import { LocalStore } from '@core/storage/syncer/localStore';

export class SprintNode implements Sprint {
    constructor(
        private localStore: LocalStore,
        private sprintState: SprintState,
    ) {}

    public get id(): number {
        return this.sprintState.id;
    }

    public get startAt(): Date {
        return this.sprintState.startAt;
    }

    public get endAt(): Date {
        return this.sprintState.endAt;
    }

    public get createdAt(): Date {
        return this.sprintState.createdAt;
    }

    public get owningTeam(): TeamNode {
        const appState = this.localStore.getState();
        const team = appState.teams[this.sprintState.owningTeamId];
        return new TeamNode(this.localStore, team);
    }

    public get tasks(): TaskNode[] {
        const appState = this.localStore.getState();
        return appState.sprintTaskRelations
            .filter((relation) => relation.sprintId === this.sprintState.id)
            .map(
                (relation) =>
                    new TaskNode(
                        this.localStore,
                        appState.tasks[relation.taskId],
                    ),
            );
    }
}
