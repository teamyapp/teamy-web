import { App } from '@core/entity/app';
import { StaticGroup } from '@core/entity/group';
import { LocalStore } from '@core/storage/syncer/localStore';

import { ThirdPartyAppState } from '../states/thirdPartyApp.state';
import { AppInstallationNode } from './appInstallation.node';
import { AppSecretNode } from './appSecret.node';
import { AppVersionNode } from './appVersion.node';
import { FilterGroupNode, StaticGroupNode } from './group.node';
import { RolloutNode } from './rollout.node';
import { TagNode } from './tag.node';
import { TeamNode } from './team.node';
import { UserNode } from './user.node';

export class AppNode implements App {
    constructor(
        private localStore: LocalStore,
        private app: ThirdPartyAppState,
    ) {}

    public get id(): number {
        return this.app.id;
    }

    public get totalInstallations(): number {
        return this.app.totalInstallations;
    }

    public get installations(): AppInstallationNode[] {
        const appState = this.localStore.getState();
        const app = appState.apps[this.app.id];
        return app.installationIds.map((installationId) => {
            const installation = appState.appInstallations[installationId];
            return new AppInstallationNode(this.localStore, installation);
        });
    }

    public get secrets(): AppSecretNode[] {
        const appState = this.localStore.getState();
        const app = appState.apps[this.app.id];
        return app.secretIds.map((secretId) => {
            const secret = appState.appSecrets[secretId];
            return new AppSecretNode(this.localStore, secret);
        });
    }

    public get managedByTeam(): TeamNode {
        return new TeamNode(
            this.localStore,
            this.localStore.getState().teams[this.app.managedByTeamId],
        );
    }

    public get versions(): AppVersionNode[] {
        const appState = this.localStore.getState();
        const app = appState.apps[this.app.id];
        return Object.values(this.app.versions).map((version) => {
            return new AppVersionNode(this.localStore, version);
        });
    }

    public get tags(): TagNode[] {
        const appState = this.localStore.getState();
        const app = appState.apps[this.app.id];
        return Array.from(app.tagIds).map((tagId) => {
            const tag = appState.tags[tagId];
            return new TagNode(this.localStore, tag);
        });
    }

    public get userGroups(): (StaticGroupNode<UserNode> | FilterGroupNode)[] {
        const appState = this.localStore.getState();
        const app = appState.apps[this.app.id];
        return app.userGroupIds.map((groupId) => {
            const group = appState.groups[groupId];
            switch (group.type) {
                case 'STATIC':
                    return new StaticGroupNode<UserNode>(
                        this.localStore,
                        group,
                        appState.userGroupRelations,
                        (userId: number) =>
                            new UserNode(
                                this.localStore,
                                appState.users[userId],
                            ),
                    );
                case 'FILTER':
                    const filterGroup = appState.filterGroups[groupId];
                    return new FilterGroupNode(
                        this.localStore,
                        group,
                        filterGroup,
                    );
            }
        });
    }

    public get teamGroups(): (StaticGroup<TeamNode> | FilterGroupNode)[] {
        const appState = this.localStore.getState();
        const app = appState.apps[this.app.id];
        return app.teamGroupIds.map((groupId) => {
            const group = appState.groups[groupId];
            switch (group.type) {
                case 'STATIC':
                    return new StaticGroupNode<TeamNode>(
                        this.localStore,
                        group,
                        appState.teamGroupRelations,
                        (teamId: number) =>
                            new TeamNode(
                                this.localStore,
                                appState.teams[teamId],
                            ),
                    );
                case 'FILTER':
                    const filterGroup = appState.filterGroups[groupId];
                    return new FilterGroupNode(
                        this.localStore,
                        group,
                        filterGroup,
                    );
            }
        });
    }

    public get userRollouts(): RolloutNode[] {
        const appState = this.localStore.getState();
        const app = appState.apps[this.app.id];
        return app.userRolloutIds.map((rolloutId) => {
            const rollout = appState.rollouts[rolloutId];
            return new RolloutNode(this.localStore, rollout);
        });
    }

    public get teamRollouts(): RolloutNode[] {
        const appState = this.localStore.getState();
        const app = appState.apps[this.app.id];
        return app.teamRolloutIds.map((rolloutId) => {
            const rollout = appState.rollouts[rolloutId];
            return new RolloutNode(this.localStore, rollout);
        });
    }

    public latestVersionForTeam(teamId?: number): AppVersionNode | undefined {
        if (!teamId) {
            return undefined;
        }

        const appState = this.localStore.getState();
        const teamAppVersion = appState.teamAppVersions.find(
            (teamAppVersion) =>
                teamAppVersion.teamId === teamId &&
                teamAppVersion.appId === this.app.id,
        );
        if (!teamAppVersion) {
            return undefined;
        }

        return this.versions.find(
            (version) => version.number === teamAppVersion.appVersion,
        );
    }
}
