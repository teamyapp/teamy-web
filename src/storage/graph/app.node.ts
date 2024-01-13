import { App } from '@core/entity/app';
import { LocalStore } from '@core/storage/syncer/localStore';

import { PluginAppState } from '../states/pluginApp.state';
import { AppInstallationNode } from './appInstallation.node';
import { AppSecretNode } from './appSecret.node';
import { AppVersionNode } from './appVersion.node';
import { TeamNode } from './team.node';

export class AppNode implements App {
    constructor(private localStore: LocalStore, private app: PluginAppState) {}

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

    public get latestVersionForTeam(): AppVersionNode | undefined {
        if (this.app.latestVersionForTeam === undefined) {
            return undefined;
        }

        const appState = this.localStore.getState();
        const app = appState.apps[this.app.id];
        const latestVersion = app.versions[this.app.latestVersionForTeam];
        if (!latestVersion) {
            return undefined;
        }

        return new AppVersionNode(this.localStore, latestVersion);
    }
}
