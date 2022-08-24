import { ExtensionRuntime } from '@teamyapp/ext';

import { IdentityClient, getAccessToken } from '@lib/identity/Identity.client';
import { Router } from '@lib/router/router';

import { absoluteUri } from '@core/config/routing';

export class TeamyExtensionRuntime implements ExtensionRuntime {
    constructor(
        private extensionVersion: number,
        private router: Router,
        private identityClient: IdentityClient,
    ) {}

    public getAssetUrl(relativePath: string): string {
        // TODO(magicoder10): use production url based on env
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
