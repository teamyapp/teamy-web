import { InvitationNode } from '@core/storage/graph/invitation.node';
import { SprintNode } from '@core/storage/graph/sprint.node';
import { TaskNode } from '@core/storage/graph/task.node';
import { TeamNode } from '@core/storage/graph/team.node';
import { UserNode } from '@core/storage/graph/user.node';
import { LocalStore } from '@core/storage/syncer/localStore';

import { AppNode } from './app.node';
import { AppVersionNode } from './appVersion.node';
import { RolloutNode } from './rollout.node';
import { StoryNode } from './story.node';
import { PhaseNode } from './phase.node';
import { ProjectNode } from './project.node';

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

    public apps(): AppNode[] {
        const appState = this.localStore.getState();
        return Object.values(appState.apps).map(
            (app) => new AppNode(this.localStore, app),
        );
    }

    public latestAppVersions(
        teamId: number,
        tagValues?: string[],
    ): AppVersionNode[] {
        const appVersionNodes: AppVersionNode[] = [];
        let filteredAppNodes: AppNode[] = this.apps();
        if (tagValues && tagValues.length > 0) {
            filteredAppNodes = filteredAppNodes.filter((appNode) =>
                appNode.tags.some((tag) => tagValues.includes(tag.value)),
            );
        }

        for (const appNode of filteredAppNodes) {
            const appVersionNode = appNode.latestVersionForTeam(teamId);
            if (appVersionNode) {
                appVersionNodes.push(appVersionNode);
            }
        }

        return appVersionNodes;
    }

    public rollout(rolloutId: number): RolloutNode | undefined {
        const appState = this.localStore.getState();
        const rollout = appState.rollouts[rolloutId];
        if (rollout) {
            return new RolloutNode(this.localStore, rollout);
        }
    }

    public story(storyId: number): StoryNode | undefined {
        const appState = this.localStore.getState();
        const story = appState.stories[storyId];
        if (story) {
            return new StoryNode(this.localStore, story);
        }
    }

    public phase(phaseId: number): PhaseNode | undefined {
        const appState = this.localStore.getState();
        const phase = appState.phases[phaseId];
        if (phase) {
            return new PhaseNode(this.localStore, phase);
        }
    }

    public project(projectId: number): ProjectNode | undefined {
        const appState = this.localStore.getState();
        const project = appState.projects[projectId];
        if (project) {
            return new ProjectNode(this.localStore, project);
        }
    }


    //test
    public projects(): ProjectNode[] {
        const appState = this.localStore.getState();
        return Object.values(appState.projects).map(
            (project) => new ProjectNode(this.localStore, project),
        );
    }
}
