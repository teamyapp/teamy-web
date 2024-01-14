import { InvitationNode } from '@core/storage/graph/invitation.node';
import { SprintNode } from '@core/storage/graph/sprint.node';
import { TaskNode } from '@core/storage/graph/task.node';
import { TeamNode } from '@core/storage/graph/team.node';
import { UserNode } from '@core/storage/graph/user.node';
import { LocalStore } from '@core/storage/syncer/localStore';
import { AppNode } from './app.node';

export class GraphSource {
    constructor(private localStore: LocalStore) {}

    public currentUser(): UserNode | undefined {
        const appState = this.localStore.getState();
        if (!appState.currUserId) {
            return;
        }

        return this.user(appState.currUserId);
    }

    public currentTeam(): TeamNode | undefined {
        const appState = this.localStore.getState();
        if (!appState.currTeamId) {
            return;
        }

        return this.team(appState.currTeamId);
    }

    public currentSprint(): SprintNode | undefined {
        const appState = this.localStore.getState();
        if (!appState.currSprintId) {
            return;
        }

        return this.sprint(appState.currSprintId);
    }

    public user(userId: number): UserNode | undefined {
        const appState = this.localStore.getState();
        const userState = appState.users[userId];
        if (!userState) {
            return;
        }

        return new UserNode(this.localStore, userState);
    }

    public team(teamId: number): TeamNode | undefined {
        const appState = this.localStore.getState();
        const teamState = appState.teams[teamId];
        if (!teamState) {
            return;
        }

        return new TeamNode(this.localStore, appState.teams[teamId]);
    }

    public task(taskId: number): TaskNode | undefined {
        const appState = this.localStore.getState();
        const taskState = appState.tasks[taskId];
        if (!taskState) {
            return;
        }

        return new TaskNode(this.localStore, appState.tasks[taskId]);
    }

    public invitation(id: number): InvitationNode | undefined {
        const appState = this.localStore.getState();
        const invitation = appState.invitations[id];
        if (invitation) {
            return new InvitationNode(this.localStore, invitation);
        }
    }

    public sprint(sprintId: number): SprintNode | undefined {
        const appState = this.localStore.getState();
        const sprintState = appState.sprints[sprintId];
        if (!sprintState) {
            return;
        }

        return new SprintNode(this.localStore, sprintState);
    }

    public app(appId: number): AppNode | undefined {
        const appState = this.localStore.getState();
        const app = appState.apps[appId];
        if (app) {
            return new AppNode(this.localStore, app);
        }
    }
}
