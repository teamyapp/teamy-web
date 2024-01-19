import { AppInstallation } from '@core/entity/appInstallation';
import { LocalStore } from '@core/storage/syncer/localStore';

import { AppInstallationState } from '../states/appInstallation.state';
import { AppVersionNode } from './appVersion.node';
import { TeamNode } from './team.node';

export class AppInstallationNode implements AppInstallation {
    constructor(
        private localStore: LocalStore,
        private appInstallation: AppInstallationState,
    ) {}

    public get id(): number {
        return this.appInstallation.id;
    }

    public get installedTeam(): TeamNode {
        return new TeamNode(
            this.localStore,
            this.localStore.getState().teams[
                this.appInstallation.installedTeamId
            ],
        );
    }

    public get activeAppVersion(): AppVersionNode {
        debugger
        const appState = this.localStore.getState();
        const app = appState.apps[this.appInstallation.appId];
        const activeAppVersion =
            app.versions[this.appInstallation.appVersionNumber];
        debugger
        return new AppVersionNode(this.localStore, activeAppVersion!);
    }
}
