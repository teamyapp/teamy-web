import { DragAndDropController } from '@lib/dragAndDrop/DragAndDropController';
import { IdentityClient } from '@lib/identity/Identity.client';
import { GraphQLClient } from '@lib/network/GraphQL.client';
import { PubSub } from '@lib/pubSub/pubSub';
import { Router, createBrowserRouter } from '@lib/router/router';
import { ShortcutMonitor } from '@lib/shortcut/monitor';
import { LocalStore } from '@lib/store/localStore';

import { getConfig } from '@core/config/config';
import { absoluteRootPath, signInFinishPath } from '@core/config/routing';
import { shortcuts } from '@core/config/shortcut';
import { Feedback } from '@core/entity/feedback';
import { getEnvironment } from '@core/env/environment';
import * as mutationEvents from '@core/event/mutation';
import { UserActionEvent } from '@core/event/userAction';
import { CommentService } from '@core/service/comment.service';
import { InvitationService } from '@core/service/invitation.service';
import { NetworkStateSynchronizer } from '@core/service/networkStateSyncer';
import { PageService } from '@core/service/page.service';
import { TaskService } from '@core/service/task.service';
import { TeamService } from '@core/service/team.service';
import { UserService } from '@core/service/user.service';
import { IAppState } from '@core/state/state';
import { createStore } from '@core/state/store';
import { InvitationClient } from '../client/invitation.client';
import { MessageClient } from '../client/message.client';
import { TaskClient } from '../client/task.client';
import { TeamClient } from '../client/team.client';
import { UserClient } from '../client/user.client';

export interface Deps {
    taskService: TaskService;
    teamService: TeamService;
    userService: UserService;
    commentService: CommentService;
    pageService: PageService;
    invitationService: InvitationService;
    userClient: UserClient;
    teamClient: TeamClient;
    taskClient: TaskClient;
    messageClient: MessageClient;
    invitationClient: InvitationClient;
    identityClient: IdentityClient;
    localStore: LocalStore<IAppState, mutationEvents.MutationEvent>;
    networkStateSyncer: NetworkStateSynchronizer;
    router: Router;
    shortcutMonitor: ShortcutMonitor<UserActionEvent>;
    dragAndDropController: DragAndDropController;
    feedbackPubSub: PubSub<Feedback>;
}

export function initDeps(): Deps {
    const env = getEnvironment();
    const identityClient = new IdentityClient(
        env,
        signInFinishPath,
        absoluteRootPath,
    );
    const config = getConfig(env);
    const teamyGraphQLV1Client = new GraphQLClient(
        identityClient,
        config.teamyGraphQLEndpoint,
    );
    const teamyGraphQLV2Client = new GraphQLClient(
        identityClient,
        config.teamyGraphQLV2Endpoint,
    );
    const taskService = new TaskService(teamyGraphQLV1Client);
    const teamService = new TeamService(teamyGraphQLV1Client);
    const userService = new UserService(teamyGraphQLV1Client);
    const commentService = new CommentService(teamyGraphQLV1Client);
    const pageService = new PageService(teamyGraphQLV1Client);

    const userClient = new UserClient(teamyGraphQLV2Client);
    const teamClient = new TeamClient(teamyGraphQLV2Client);
    const taskClient = new TaskClient(teamyGraphQLV2Client);
    const messageClient = new MessageClient(teamyGraphQLV2Client);
    const invitationClient = new InvitationClient(teamyGraphQLV2Client);

    const invitationService = new InvitationService(teamyGraphQLV1Client);
    const localStore = createStore();
    const networkStateSyncer = new NetworkStateSynchronizer(
        localStore,
        taskService,
        teamService,
        pageService,
    );
    const router = createBrowserRouter();
    const shortcutMonitor = new ShortcutMonitor(shortcuts);
    const dragAndDropController = new DragAndDropController();
    const feedbackPubSub = new PubSub<Feedback>();
    return {
        taskService,
        teamService,
        userService,
        commentService,
        pageService,
        invitationService,
        userClient,
        teamClient,
        taskClient,
        messageClient,
        invitationClient,
        identityClient,
        localStore,
        networkStateSyncer,
        router,
        shortcutMonitor,
        dragAndDropController,
        feedbackPubSub,
    };
}
