import { getConfig } from './config/config';
import { getEnvironment } from './env/environment';
import { IdentityClient } from './identity/Identity.client';
import { IdentityHTTPClient } from './identity/IdentityHTTP.client';
import { GraphQLClient } from './network/GraphQL.client';
import { FetchHTTPClient } from './network/FetchHTTP.client';
import { StatusService } from './service/Status.service';
import { TaskService } from './service/Task.service';
import { TeamService } from './service/Team.service';
import { UserService } from './service/User.service';

export interface Deps {
    taskService: TaskService;
    teamService: TeamService;
    userService: UserService;
    executionModeService: StatusService;
    identityClient: IdentityClient;
    graphql: GraphQLClient;
}

export function initDeps(): Deps {
    const env = getEnvironment();
    let httpClient = new FetchHTTPClient();
    const identityClient = new IdentityClient(env, httpClient);
    httpClient = new IdentityHTTPClient(identityClient, httpClient);
    const config = getConfig(env);
    const teamyGraphQLClient = new GraphQLClient(
        identityClient,
        config.teamyGraphQLEndpoint,
    );
    const taskService = new TaskService(teamyGraphQLClient);
    const teamService = new TeamService(teamyGraphQLClient);
    const userService = new UserService(teamyGraphQLClient);
    const executionModeService = new StatusService(teamyGraphQLClient);
    return {
        taskService,
        teamService,
        userService,
        executionModeService,
        identityClient,
        graphql: teamyGraphQLClient,
    };
}
