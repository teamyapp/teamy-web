import { RenderFunc, ThirdPartyAppClient } from '@teamyapp/ext';
import { RefObject } from 'react';

import { IdentityClient, getAccessToken } from '@lib/identity/Identity.client';
import { Router } from '@lib/router/router';
import { TeamyThirdPartyAppFeedbackUI } from '@lib/thirdPartyApp/DynamicFeedback';

import { absoluteRootPath, absoluteUri, taskPath } from '@core/routing/routes';
import { LocalStore } from '@core/storage/syncer/localStore';
import { FileClient } from '@core/client/file.client';

export class TeamyThirdPartyAppClient implements ThirdPartyAppClient {
    constructor(
        private localStore: LocalStore,
        private fileClient: FileClient,
        private router: Router,
        private identityClient: IdentityClient,
        private feedbackRef: RefObject<TeamyThirdPartyAppFeedbackUI>,
    ) {}

    getAccessToken(): string {
        return getAccessToken();
    }

    getResourceUrl(appId: number, versionNumber: number): string {
        return this.fileClient.getRemoteFileUrl(
            `files/apps/${appId}/${versionNumber}/app.js`,
        );
    }

    getTeamId(): number | undefined {
        return this.localStore.getState().currTeamId;
    }

    linkAccount(authProvider: string): void {
        this.identityClient.createUserLink(
            authProvider,
            absoluteUri(this.router.currentUri!),
        );
    }

    getTaskPath(teamId: number, taskId: number): string {
        return `${absoluteRootPath}${taskPath(teamId, taskId)}`;
    }

    showDynamicFeedback(renderFunc: RenderFunc): void {
        this.feedbackRef.current?.show(renderFunc);
    }
}
