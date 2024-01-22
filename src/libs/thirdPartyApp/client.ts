import {LocalStore} from '@core/storage/syncer/localStore';
import {DynamicFeedbackUI} from '@lib/ui/DynamicFeedback';
import {ThirdPartyAppClient} from '@teamyapp/ext';

import {IdentityClient, getAccessToken} from '@lib/identity/Identity.client';
import {Router} from '@lib/router/router';

import {absoluteRootPath, absoluteUri, taskPath} from '@core/routing/routes';
import {ReactNode, RefObject} from 'react';

export class TeamyThirdPartyAppClient implements ThirdPartyAppClient {
    constructor(
        private localStore: LocalStore,
        private router: Router,
        private identityClient: IdentityClient,
        private dynamicFeedbackRef: RefObject<DynamicFeedbackUI>,
    ) {
    }

    getAccessToken(): string {
        return getAccessToken();
    }

    getResourceUrl(appPacketRelativePath: string): string {
        return `http://localhost:8082/app/${appPacketRelativePath}`;
    }

    getTeamId(): number|undefined {
        return this.localStore.getState().currTeamId;
    }

    linkAccount(authProvider: string): void {
        this.identityClient.createUserLink(
                authProvider,
                absoluteUri(this.router.currentUri!),
            );
    }

    getTaskPath(teamId: number, taskId: number): string {
        return `${absoluteRootPath}${taskPath(teamId, taskId)}`
    }

    showDynamicFeedback(feedbackView: ReactNode): void {
        this.dynamicFeedbackRef.current?.show(feedbackView);
    }
}
