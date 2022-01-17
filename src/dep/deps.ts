import { IdentityClient } from '@lib/identity/Identity.client';
import { FetchHTTPClient } from '@lib/network/FetchHTTP.client';
import { GraphQLClient } from '@lib/network/GraphQL.client';
import { Router } from '@lib/router/router';
import { LocalStore } from '@lib/store/localStore';

import { getConfig } from '@core/config/config';
import * as events from '@core/entity/events';
import { getEnvironment } from '@core/env/environment';
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
    localStore: LocalStore<IAppState, events.MutationEvent>;
    router: Router;
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
    const router = new Router();
    router.browserInit();

    new NetworkStateSynchronizer(
        localStore,
        taskService,
        teamService,
        pageService,
    );
    return {
        taskService,
        teamService,
        userService,
        commentService,
        pageService,
        identityClient,
        localStore,
        router,
    };
}
