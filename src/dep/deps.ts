import { DragAndDropController } from '@lib/dragAndDrop/DragAndDropController';
import {getAccessToken, IdentityClient} from '@lib/identity/Identity.client';
import { GraphQLClient } from '@lib/network/GraphQL.client';
import { PubSub } from '@lib/pubSub/pubSub';
import { Router, createBrowserRouter } from '@lib/router/router';
import { ShortcutMonitor } from '@lib/shortcut/monitor';

import { InvitationClient } from '@core/client/invitation.client';
import { MessageClient } from '@core/client/message.client';
import { TaskClient } from '@core/client/task.client';
import { TeamClient } from '@core/client/team.client';
import { UserClient } from '@core/client/user.client';
import { getConfig } from '@core/config/config';
import { absoluteRootPath, signInFinishPath } from '@core/config/routing';
import { shortcuts } from '@core/config/shortcut';
import { Feedback } from '@core/entity/feedback';
import { getEnvironment } from '@core/env/environment';
import { UserActionEvent } from '@core/event/userAction';
import { GraphSource } from '@core/storage/graph/graphSource';
import { LocalStore } from '@core/storage/syncer/localStore';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';
import {WithIdentity} from '@lib/network/WithIdentity';
import {FetchHTTPClient} from '@lib/network/FetchHTTP.client';

export interface Deps {
    identityClient: IdentityClient;
    router: Router;
    localStore: LocalStore;
    graphSource: GraphSource;
    stateSyncer: StateSyncer;
    shortcutMonitor: ShortcutMonitor<UserActionEvent>;
    dragAndDropController: DragAndDropController;
    feedbackPubSub: PubSub<Feedback>;
}

export function initDeps(): Deps {
    const env = getEnvironment();
    const httpClient = new WithIdentity(new FetchHTTPClient());
    const identityClient = new IdentityClient(
        env,
        signInFinishPath,
        absoluteRootPath,
        httpClient,
    );
    const config = getConfig(env);
    const teamyGraphQLClient = new GraphQLClient(
        `${config.servicesWebAPIEndpoint}/graphql`,
        getAccessToken,
    );
    const userClient = new UserClient(teamyGraphQLClient);
    const taskClient = new TaskClient(teamyGraphQLClient);
    const teamClient = new TeamClient(teamyGraphQLClient);
    const invitationClient = new InvitationClient(teamyGraphQLClient);
    const messageClient = new MessageClient(teamyGraphQLClient);
    const localStore = new LocalStore();
    const graphSource = new GraphSource(localStore);
    const stateSyncer = new StateSyncer(
        config.servicesWebSocketAPIEndpoint,
        identityClient,
        localStore,
        taskClient,
        messageClient,
        teamClient,
        userClient,
        invitationClient,
    );
    const router = createBrowserRouter();
    const shortcutMonitor = new ShortcutMonitor(shortcuts);
    const dragAndDropController = new DragAndDropController();
    const feedbackPubSub = new PubSub<Feedback>();
    return {
        identityClient,
        router,
        localStore,
        graphSource,
        stateSyncer,
        shortcutMonitor,
        dragAndDropController,
        feedbackPubSub,
    };
}
