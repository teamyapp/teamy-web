import { LocalStore } from '@core/storage/syncer/localStore';

import { Invitation } from './invitation';
import { Task } from './task';
import { Team } from './team';
import { User } from './user';

export class GraphSource {
    constructor(private localStore: LocalStore) {}

    public currentUser(): User | undefined {
        const appState = this.localStore.getState();
        if (!appState.currUserId) {
            return;
        }

        return new User(appState, appState.users[appState.currUserId]);
    }

    public currentTeam(): Team | undefined {
        const appState = this.localStore.getState();
        if (!appState.currTeamId) {
            return;
        }

        return this.team(appState.currTeamId);
    }

    public team(teamId: number): Team | undefined {
        const appState = this.localStore.getState();
        const teamState = appState.teams[teamId];
        if (!teamState) {
            return;
        }

        return new Team(appState, appState.teams[teamId]);
    }

    public task(taskId: number): Task | undefined {
        const appState = this.localStore.getState();
        const taskState = appState.tasks[taskId];
        if (!taskState) {
            return;
        }

        return new Task(appState, appState.tasks[taskId]);
    }

    public invitation(id: number): Invitation | undefined {
        const appState = this.localStore.getState();
        const invitation = appState.invitations[id];
        if (invitation) {
            return new Invitation(appState, invitation);
        }
    }
}
