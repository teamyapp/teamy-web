import { RenderFunc, ThirdPartyAppClient } from '@teamyapp/ext';
import { RefObject } from 'react';

import { IdentityClient, getAccessToken } from '@lib/identity/Identity.client';
import { Router } from '@lib/router/router';
import { TeamyThirdPartyAppFeedbackUI } from '@lib/thirdPartyApp/DynamicFeedback';

import { FileClient } from '@core/client/file.client';
import { absoluteRootPath, absoluteUri, taskPath } from '@core/routing/routes';
import { LocalStore } from '@core/storage/syncer/localStore';

export class TeamyThirdPartyAppClient implements ThirdPartyAppClient {
    constructor(
        private localStore: LocalStore,
        private fileClient: FileClient,
        private router: Router,
        private identityClient: IdentityClient,
        private feedbackRef: RefObject<TeamyThirdPartyAppFeedbackUI>,
        private appId: number,
        private versionNumber: number,
    ) {}

    getAccessToken(): string {
        return getAccessToken();
    }

    getResourceUrl(appPacketRelativePath: string): string {
        const filePath = `files/apps/${this.appId}/${this.versionNumber}/${appPacketRelativePath}`;
        return this.fileClient.getRemoteFileUrl(filePath);
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
