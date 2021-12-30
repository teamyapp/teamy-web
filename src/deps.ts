import { getConfig } from '@config/config';
import * as events from '@entity/events';
import { getEnvironment } from '@env/environment';
import { IdentityClient } from '@lib/identity/Identity.client';
import { FetchHTTPClient } from '@lib/network/FetchHTTP.client';
import { GraphQLClient } from '@lib/network/GraphQL.client';
import { LocalStore } from '@lib/store/localStore';
import { CommentService } from '@service/comment.service';
import { createNetworkStateMutator } from '@service/networkStateMutator';
import { ResponsiveStateService } from '@service/responsiveState.service';
import { StatusService } from '@service/status.service';
import { TaskService } from '@service/task.service';
import { TeamService } from '@service/team.service';
import { UserService } from '@service/user.service';
import { IAppState } from '@state/state';
import { createStore } from '@state/store';

export interface Deps {
    taskService: TaskService;
    teamService: TeamService;
    userService: UserService;
    commentService: CommentService;
    statusService: StatusService;
    identityClient: IdentityClient;
    localStore: LocalStore<IAppState, events.MutationEvent>;
    responsiveStateService: ResponsiveStateService<
        IAppState,
        events.MutationEvent
    >;
    graphql: GraphQLClient;
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
    const statusService = new StatusService(teamyGraphQLClient);
    const commentService = new CommentService(teamyGraphQLClient);
    const localStore = createStore();
    const networkStateMutator = createNetworkStateMutator(taskService);
    const responsiveStateService = new ResponsiveStateService<
        IAppState,
        events.MutationEvent
    >(localStore, networkStateMutator);
    return {
        taskService,
        teamService,
        userService,
        commentService,
        statusService,
        identityClient,
        localStore,
        responsiveStateService,
        graphql: teamyGraphQLClient,
    };
}
