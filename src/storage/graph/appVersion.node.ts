import { AppVersion } from '@core/entity/appVersion';
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
        return this.appVersion.changes;
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

    public get iconUrl(): string {
        return this.appVersion.iconUrl;
    }

    public get prices(): MoneyNode[] {
        return this.appVersion.prices.map((price) => new MoneyNode(price));
    }

    public get isReady(): boolean {
        return this.appVersion.isReady;
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
}
