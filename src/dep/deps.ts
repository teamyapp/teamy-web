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

export interface Deps {
    taskService: TaskService;
    teamService: TeamService;
    userService: UserService;
    commentService: CommentService;
    pageService: PageService;
    invitationService: InvitationService;
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
        identityClient,
        localStore,
        networkStateSyncer,
        router,
        shortcutMonitor,
        dragAndDropController,
        feedbackPubSub,
    };
}
