import { AppVersion, AppVersionStatus } from '@core/entity/appVersion';
import { LocalStore } from '@core/storage/syncer/localStore';

import { AppVersionState } from '../states/appVersion.state';
import { AppNode } from './app.node';
import { MoneyNode } from './money.node';
import { UserNode } from './user.node';

export class AppVersionNode implements AppVersion {
    constructor(
        private localStore: LocalStore,
        private appVersion: AppVersionState,
    ) {}

    public get number(): number {
        return this.appVersion.number;
    }

    public get appName(): string {
        return this.appVersion.appName;
    }

    public get description(): string {
        return this.appVersion.description;
    }

    public get changes(): string[] {
        const appState = this.localStore.getState();
        const changes = []
        for (const changeId in appState.appVersionChanges) {
            if ((appState.appVersionChanges[changeId].versionNumber === this.appVersion.number ) &&
                (appState.appVersionChanges[changeId].appId === this.appVersion.appId)) {
                changes.push(appState.appVersionChanges[changeId].change);
            }
        }

        return changes;
    }

    public get createdAt(): Date {
        return this.appVersion.createdAt;
    }

    public get createdBy(): UserNode {
        return new UserNode(
            this.localStore,
            this.localStore.getState().users[this.appVersion.creatorUserId],
        );
    }

    public iconPath(size: number): string {
       return `files/apps/${this.appVersion.appId}/${this.appVersion.number}/icons/${size}.png`;        
    }

    public get prices(): MoneyNode[] {
        const appState = this.localStore.getState();
        return appState.appVersionPrices
            .filter(
                (price) =>
                    price.versionNumber === this.appVersion.number &&
                    price.appId === this.appVersion.appId,
            )
            .map((price) => {
                return new MoneyNode(price.price, price.currency);
            });
    }

    public get status(): AppVersionStatus {
        return this.appVersion.status;
    }

    public get locked(): boolean {
        return this.appVersion.locked;
    }

    public get app(): AppNode {
        return new AppNode(
            this.localStore,
            this.localStore.getState().apps[this.appVersion.appId],
        );
    }

    public get errorMessage(): string | undefined {
        return this.appVersion.errorMessage;
    }

    public get packagePath(): string {
        return `files/apps/${this.appVersion.appId}/${this.appVersion.number}`;
    }
}
