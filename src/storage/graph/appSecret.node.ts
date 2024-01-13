import { AppSecret } from '@core/entity/appSecret';

import { AppSecretState } from '../states/appSecret.state';
import { LocalStore } from '../syncer/localStore';
import { AppNode } from './app.node';
import { UserNode } from './user.node';

export class AppSecretNode implements AppSecret {
    constructor(
        private localStore: LocalStore,
        private appSecret: AppSecretState,
    ) {}

    public get id(): number {
        return this.appSecret.id;
    }

    public get name(): string {
        return this.appSecret.name;
    }

    public get addedAt(): Date {
        return this.appSecret.addedAt;
    }

    public get addedBy(): UserNode {
        return new UserNode(
            this.localStore,
            this.localStore.getState().users[this.appSecret.addedByUserId],
        );
    }

    public get lastUsedAt(): Date | undefined {
        return this.appSecret.lastUsedAt;
    }

    public get app(): AppNode {
        return new AppNode(
            this.localStore,
            this.localStore.getState().apps[this.appSecret.appId],
        );
    }
}
