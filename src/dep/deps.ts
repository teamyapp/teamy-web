import { DragAndDropController } from '@lib/dragAndDrop/DragAndDropController';
import { IdentityClient } from '@lib/identity/Identity.client';
import { FetchHTTPClient } from '@lib/network/FetchHTTP.client';
import { GraphQLClient } from '@lib/network/GraphQL.client';
import { Router, createBrowserRouter } from '@lib/router/router';
import { ShortcutMonitor } from '@lib/shortcut/monitor';
import { LocalStore } from '@lib/store/localStore';

import { getConfig } from '@core/config/config';
import { shortcuts } from '@core/config/shortcut';
import { getEnvironment } from '@core/env/environment';
import * as mutationEvents from '@core/event/mutation';
import { UserActionEvent } from '@core/event/userAction';
import { CommentService } from '@core/service/comment.service';
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
    identityClient: IdentityClient;
    localStore: LocalStore<IAppState, mutationEvents.MutationEvent>;
    router: Router;
    shortcutMonitor: ShortcutMonitor<UserActionEvent>;
    dragAndDropController: DragAndDropController;
}

export function initDeps(): Deps {
    const env = getEnvironment();
    let httpClient = new FetchHTTPClient();
    const identityClient = new IdentityClient(env, httpClient);
    const config = getConfig(env);
    const teamyGraphQLClient = new GraphQLClient(
        identityClient,
        config.teamyGraphQLEndpoint,
    );
    const taskService = new TaskService(teamyGraphQLClient);
    const teamService = new TeamService(teamyGraphQLClient);
    const userService = new UserService(teamyGraphQLClient);
    const commentService = new CommentService(teamyGraphQLClient);
    const pageService = new PageService(teamyGraphQLClient);
    const localStore = createStore();
    new NetworkStateSynchronizer(
        localStore,
        taskService,
        teamService,
        pageService,
    );
    const router = createBrowserRouter();
    const shortcutMonitor = new ShortcutMonitor(shortcuts);
    const dragAndDropController = new DragAndDropController();
    return {
        taskService,
        teamService,
        userService,
        commentService,
        pageService,
        identityClient,
        localStore,
        router,
        shortcutMonitor,
        dragAndDropController,
    };
}
