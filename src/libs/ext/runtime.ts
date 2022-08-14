import { ExtensionRuntime } from '@teamyapp/ext';
import { getAccessToken, IdentityClient } from '@lib/identity/Identity.client';
import { absoluteUri } from '@core/config/routing';
import { Router } from '@lib/router/router';

export class TeamyExtensionRuntime implements ExtensionRuntime {
    constructor(
        private extensionVersion: number,
        private router: Router,
        private identityClient: IdentityClient) {
    }

    public getAssetUrl(relativePath: string): string {
        return `http://localhost:8082/app/${relativePath}`;
    }

    getAccessToken() {
        // TODO: check permission
        return getAccessToken();
    }

    linkAccount(authProvider: string) {
        this.identityClient.createUserLink(
            authProvider,
            absoluteUri(this.router.currentUri!),
        );
    }
}