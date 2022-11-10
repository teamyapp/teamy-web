import { DragAndDropController } from '@lib/dragAndDrop/DragAndDropController';
import { BoundingBoxChangeEventMonitor } from '@lib/event/boundingBoxEvent';
import { EventDetectionScheduler } from '@lib/event/scheduler';
import { FileUploadSessionFactory } from '@lib/fileUpload/fileUploadSession';
import { IdentityClient } from '@lib/identity/Identity.client';
import { RelativeLayout } from '@lib/layout/relativeLayout';
import { BuiltInRandomNumberGenerator } from '@lib/math/randomNumberGenerator';
import { WithMiddlewares } from '@lib/middleware/middleware';
import { FetchHTTPClient } from '@lib/network/FetchHTTP.client';
import { GraphQLClient } from '@lib/network/GraphQL.client';
import { HTTPClient } from '@lib/network/HTTP.client';
import { clientHTTPWithIdentity } from '@lib/network/middleware/clientHTTPWithIdentity';
import { clientHTTPWithLogger } from '@lib/network/middleware/clientHTTPWithLogger';
import { clientHTTPWithRequestId } from '@lib/network/middleware/clientHTTPWithRequestId';
import { clientHTTPWithRetry } from '@lib/network/middleware/clientHTTPWithRetry';
import { PubSub } from '@lib/pubSub/pubSub';
import { ExponentialBackoff } from '@lib/retry/backoff/exponential';
import { MaxCountRetry } from '@lib/retry/maxCount';
import { Router, createBrowserRouter } from '@lib/router/router';
import { BuiltInRuntime } from '@lib/runtime/runtime';
import { ShortcutMonitor } from '@lib/shortcut/monitor';
import { Logger } from '@lib/telemetry/Logger';
import { RawLogger } from '@lib/telemetry/RawLogger';
import { TelemetryClient } from '@lib/telemetry/TelemetryClient';
import { logWithRequestId } from '@lib/telemetry/middleware/logWithRequestId';
import { logWithServiceName } from '@lib/telemetry/middleware/logWithServiceName';

import { InvitationClient } from '@core/client/invitation.client';
import { MessageClient } from '@core/client/message.client';
import { SprintClient } from '@core/client/sprint.client';
import { TaskClient } from '@core/client/task.client';
import { TeamClient } from '@core/client/team.client';
import { TeamMemberClient } from '@core/client/teamMember.client';
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
import { StateSyncClient } from '@core/storage/syncer/stateSyncClient';
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
    const config = getConfig(env);
    const httpMiddlewares = [
        clientHTTPWithRequestId,
        clientHTTPWithIdentity,
        clientHTTPWithRetry(
            new MaxCountRetry(
                new BuiltInRuntime(),
                new ExponentialBackoff(new BuiltInRandomNumberGenerator()),
                config.maxAPIRetryTimes,
            ),
        ),
    ];
    const httpClient = WithMiddlewares<HTTPClient>(
        new FetchHTTPClient(),
        httpMiddlewares,
    );
    const telemetryClient = new TelemetryClient(
        config.cloudWebAPIEndpoint,
        httpClient,
    );
    const logger = WithMiddlewares<Logger>(
        new RawLogger(config.defaultLogLevel, new BuiltInRuntime(), telemetryClient),
        [
            logWithRequestId, 
            logWithServiceName('teamy-web-browser')
        ],
    );
    const httpWithLogger = WithMiddlewares<HTTPClient>(new FetchHTTPClient(), [
        ...httpMiddlewares,
        clientHTTPWithLogger(logger),
    ]);
    const identityClient = new IdentityClient(
        env,
        signInFinishPath,
        absoluteRootPath,
        httpWithLogger,
    );
    const teamyGraphQLClient = new GraphQLClient(
        `${config.servicesWebAPIEndpoint}/graphql`,
        httpWithLogger,
    );
    const userClient = new UserClient(teamyGraphQLClient);
    const taskClient = new TaskClient(teamyGraphQLClient);
    const teamClient = new TeamClient(teamyGraphQLClient);
    const teamMemberClient = new TeamMemberClient(teamyGraphQLClient);
    const invitationClient = new InvitationClient(teamyGraphQLClient);
    const messageClient = new MessageClient(teamyGraphQLClient);
    const sprintClient = new SprintClient(teamyGraphQLClient);
    const localStore = new LocalStore();
    const graphSource = new GraphSource(localStore);
    const stateSyncClient = new StateSyncClient(
        config.servicesWebAPIEndpoint,
        httpWithLogger,
    );
    const stateSyncer = new StateSyncer(
        stateSyncClient,
        config.servicesWebSocketAPIEndpoint,
        identityClient,
        localStore,
        taskClient,
        messageClient,
        teamClient,
        teamMemberClient,
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
