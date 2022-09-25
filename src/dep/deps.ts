import { DragAndDropController } from '@lib/dragAndDrop/DragAndDropController';
import { BoundingBoxChangeEventMonitor } from '@lib/event/boundingBoxEvent';
import { EventDetectionScheduler } from '@lib/event/scheduler';
import { FileUploadSessionFactory } from '@lib/fileUpload/fileUploadSession';
import { IdentityClient, getAccessToken } from '@lib/identity/Identity.client';
import { RelativeLayout } from '@lib/layout/relativeLayout';
import { FetchHTTPClient } from '@lib/network/FetchHTTP.client';
import { GraphQLClient } from '@lib/network/GraphQL.client';
import { WithIdentity } from '@lib/network/WithIdentity';
import { PubSub } from '@lib/pubSub/pubSub';
import { Router, createBrowserRouter } from '@lib/router/router';
import { ShortcutMonitor } from '@lib/shortcut/monitor';

import { InvitationClient } from '@core/client/invitation.client';
import { MessageClient } from '@core/client/message.client';
import { SprintClient } from '@core/client/sprint.client';
import { TaskClient } from '@core/client/task.client';
import { TeamClient } from '@core/client/team.client';
import { UserClient } from '@core/client/user.client';
import { getConfig } from '@core/config/config';
import { DragAndDropContext } from '@core/config/dragAndDrop';
import { absoluteRootPath, signInFinishPath } from '@core/config/routing';
import { shortcuts } from '@core/config/shortcut';
import { Feedback } from '@core/entity/feedback';
import { getEnvironment } from '@core/env/environment';
import { UserActionEvent } from '@core/event/userAction';
import { GraphSource } from '@core/storage/graph/graphSource';
import { LocalStore } from '@core/storage/syncer/localStore';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

export interface Deps {
    eventDetectionScheduler: EventDetectionScheduler;
    relativeLayout: RelativeLayout;
    identityClient: IdentityClient;
    router: Router;
    localStore: LocalStore;
    graphSource: GraphSource;
    stateSyncer: StateSyncer;
    shortcutMonitor: ShortcutMonitor<UserActionEvent>;
    dragAndDropController: DragAndDropController<DragAndDropContext>;
    feedbackPubSub: PubSub<Feedback>;
    fileUploadSessionFactory: FileUploadSessionFactory;
}

export function initDeps(): Deps {
    const env = getEnvironment();
    let httpClient = new FetchHTTPClient();
    httpClient = new WithIdentity(httpClient);
    const identityClient = new IdentityClient(
        env,
        signInFinishPath,
        absoluteRootPath,
        httpClientWithIdentity,
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
    const sprintClient = new SprintClient(teamyGraphQLClient);
    const localStore = new LocalStore();
    const graphSource = new GraphSource(localStore);
    const stateSyncer = new StateSyncer(
        config.servicesWebAPIEndpoint,
        httpClient,
        config.servicesWebSocketAPIEndpoint,
        identityClient,
        localStore,
        taskClient,
        messageClient,
        teamClient,
        userClient,
        invitationClient,
        sprintClient,
    );
    const router = createBrowserRouter();
    const shortcutMonitor = new ShortcutMonitor(shortcuts);
    const dragAndDropController =
        new DragAndDropController<DragAndDropContext>();
    const feedbackPubSub = new PubSub<Feedback>();
    const fileUploadSessionFactory = new FileUploadSessionFactory(
        config.cloudWebAPIEndpoint,
    );
    const eventDetectionScheduler = new EventDetectionScheduler();
    const boundingBoxChangeEventMonitor = new BoundingBoxChangeEventMonitor();
    eventDetectionScheduler.addEventMonitor(
        'boundingBoxChange',
        boundingBoxChangeEventMonitor,
    );
    const relativeLayout = new RelativeLayout(boundingBoxChangeEventMonitor);
    return {
        eventDetectionScheduler,
        relativeLayout,
        identityClient,
        router,
        localStore,
        graphSource,
        stateSyncer,
        shortcutMonitor,
        dragAndDropController,
        feedbackPubSub,
        fileUploadSessionFactory,
    };
}
