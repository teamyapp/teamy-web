import { DragAndDropController } from '@lib/dragAndDrop/DragAndDropController';
import { BoundingBoxChangeEventMonitor } from '@lib/event/boundingBoxEvent';
import { KeyBoardEventMonitor } from '@lib/event/keyBoardEventMoniter';
import { EventDetectionScheduler } from '@lib/event/scheduler';
import { FileUploadSessionFactory } from '@lib/fileUpload/fileUploadSession';
import { IdentityClient } from '@lib/identity/Identity.client';
import { IdentityConfig } from '@lib/identity/config';
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
import { Router } from '@lib/router/router';
import { BuiltInRuntime } from '@lib/runtime/runtime';
import { ShortcutMonitor } from '@lib/shortcut/monitor';
import { Logger } from '@lib/telemetry/Logger';
import { RawLogger } from '@lib/telemetry/RawLogger';
import { TelemetryClient } from '@lib/telemetry/TelemetryClient';
import { logWithCommit } from '@lib/telemetry/middleware/logWithCommit';
import { logWithRequestId } from '@lib/telemetry/middleware/logWithRequestId';
import { logWithServiceName } from '@lib/telemetry/middleware/logWithServiceName';
import { GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport';
import { AppClient } from '@core/client/app.client';
import { AppVersionClient } from '@core/client/appVersion.client';
import { FileClient } from '@core/client/file.client';
import { InvitationClient } from '@core/client/invitation.client';
import { MessageClient } from '@core/client/message.client';
import { SprintClient } from '@core/client/sprint.client';
import { TaskClient } from '@core/client/task.client';
import { TeamClient } from '@core/client/team.client';
import { TeamMemberClient } from '@core/client/teamMember.client';
import { UserClient } from '@core/client/user.client';
import { Config } from '@core/config/config';
import { DragAndDropContext } from '@core/config/dragAndDrop';
import { shortcuts } from '@core/config/shortcut';
import { FeatureToggle, getFeatureToggle } from '@core/config/toggle';
import { Feedback } from '@core/entity/feedback';
import { UserActionEvent } from '@core/event/userAction';
import { absoluteRootPath, signInFinishPath } from '@core/routing/routes';
import { GraphSource } from '@core/storage/graph/graphSource';
import { LocalStore } from '@core/storage/syncer/localStore';
import { StateSyncClient } from '@core/storage/syncer/stateSyncClient';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';
import { ProjectClient } from '@core/client/project.client';
import { PhaseClient } from '@core/client/phase.client';
import { StoryClient } from '@core/client/story.client';
import { TeamMemberGroupClient } from '@core/client/teamMemberGroup.client';
import { AttachmentClient } from '@core/client/attachment.client';
import { TaskServiceClient, TaskLinkServiceClient, AttachmentServiceClient, MessageServiceClient, ProjectServiceClient, PhaseServiceClient, StoryServiceClient } from '@teamyapp/proto';
import { clientGRPCWithIdentity } from '@lib/network/grpcInterceptor/clientGRPCWithIdentiy';
import { clientGRPCWithRequestId } from '@lib/network/grpcInterceptor/clientGRPCWithRequestId';
import { clientGRPCWithLogger } from '@lib/network/grpcInterceptor/clientGRPCWithLogger';

export interface Deps {
    featureToggle: FeatureToggle;
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
    keyBoardEventMonitor: KeyBoardEventMonitor;
    fileClient: FileClient;
}

export function initDeps(config: Config): Deps {
    //  can not set retry for telemetry, because retry requires logger
    const httpMiddlewares = [clientHTTPWithRequestId, clientHTTPWithIdentity];
    const httpClient = WithMiddlewares<HTTPClient>(
        new FetchHTTPClient(),
        httpMiddlewares,
    );
    const telemetryClient = new TelemetryClient(
        config.cloudWebAPIEndpoint,
        httpClient,
    );
    const logger = WithMiddlewares<Logger>(
        new RawLogger(
            config.defaultLogLevel,
            new BuiltInRuntime(),
            telemetryClient,
        ),
        [
            logWithRequestId,
            logWithServiceName('teamy/web-browser'),
            logWithCommit(GIT_LONG_COMMIT_HASH),
        ],
    );
    const shortBackOff = new ExponentialBackoff(
        new BuiltInRandomNumberGenerator(),
    );
    const longBackOff = new ExponentialBackoff(
        new BuiltInRandomNumberGenerator(),
        {
            minDelay: config.longBackOffMinDelayMs,
            maxDelay: config.longBackOffMaxDelayMs,
        },
    );

    const makeRetry = () =>new MaxCountRetry(
        new BuiltInRuntime(),
        logger,
        shortBackOff,
        longBackOff,
        config.maxAPIRetryTimes,
    );
    const transport = new GrpcWebFetchTransport({
        baseUrl: config.servicesWebRPCAPIEndpoint,
        interceptors: [
            {
                interceptUnary: clientGRPCWithIdentity,
            },
            {
                interceptUnary: clientGRPCWithRequestId,
            },
            {
                interceptUnary: clientGRPCWithLogger(logger),
            }
        ],
    });

    const taskGRPCClient = new TaskServiceClient(transport);
    const taskLinkGRPCClient = new TaskLinkServiceClient(transport);
    const attachmentGRPCClient = new AttachmentServiceClient(transport);
    const messageGRPCClient = new MessageServiceClient(transport);
    const projectGRPCClient = new ProjectServiceClient(transport);
    const phaseGRPCClient = new PhaseServiceClient(transport);
    const storyGRPCClient = new StoryServiceClient(transport);

    const httpWithLogger = WithMiddlewares<HTTPClient>(new FetchHTTPClient(), [
        ...httpMiddlewares,
        clientHTTPWithLogger(logger),
        clientHTTPWithRetry(makeRetry),
    ]);

    const identityConfig: IdentityConfig = {
        apiBaseEndpoint: config.identityApiBaseEndpoint,
        cookieDomain: config.identityCookieDomain,
        cookieSecure: config.identityCookieSecure,
        signInLink: config.identitySignInLink,
        signInFinishLink: config.identitySignInFinishLink,
    };
    const identityClient = new IdentityClient(
        signInFinishPath,
        absoluteRootPath,
        httpWithLogger,
        identityConfig,
    );
    const fileClient = new FileClient(config.cloudWebAPIEndpoint);
    const teamyGraphQLClient = new GraphQLClient(
        `${config.servicesWebAPIEndpoint}/graphql`,
        httpWithLogger,
    );
    const appClient = new AppClient(teamyGraphQLClient);
    const userClient = new UserClient(teamyGraphQLClient);
    const taskClient = new TaskClient(teamyGraphQLClient);
    const teamClient = new TeamClient(teamyGraphQLClient);
    const attachmentClient = new AttachmentClient(teamyGraphQLClient);
    const teamMemberClient = new TeamMemberClient(teamyGraphQLClient);
    const teamMemberGroupClient = new TeamMemberGroupClient(teamyGraphQLClient);
    const invitationClient = new InvitationClient(teamyGraphQLClient);
    const sprintClient = new SprintClient(teamyGraphQLClient);
    const appVersionClient = new AppVersionClient(teamyGraphQLClient);
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
        appClient,
        taskClient,
        attachmentClient,
        teamClient,
        teamMemberClient,
        teamMemberGroupClient,
        userClient,
        appVersionClient,
        invitationClient,
        sprintClient,
        taskGRPCClient,
        taskLinkGRPCClient,
        attachmentGRPCClient,
        messageGRPCClient,
        projectGRPCClient,
        phaseGRPCClient,
        storyGRPCClient,
        makeRetry,
    );
    const router = new Router();
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
    const keyBoardEventMonitor = new KeyBoardEventMonitor();
    const featureToggle = getFeatureToggle();
    return {
        keyBoardEventMonitor,
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
        featureToggle,
        fileClient,
    };
}
