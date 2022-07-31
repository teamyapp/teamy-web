import { AuthProvider, LinkedUser } from '@core/entity/linkedUser';
import { UserLinkState } from '@core/storage/states/userLink.state';

export class LinkedUserNode implements LinkedUser {
    constructor(private userLinkState: UserLinkState) {}

    public get authProvider(): AuthProvider {
        return this.userLinkState.authProvider;
    }

    public get id(): number {
        return this.userLinkState.externalUserId;
    }

    public get label(): string {
        return this.userLinkState.externalUserLabel;
    }
}
