import { getConfig } from './config/config';
import { getEnvironment } from './env/environment';
import { IdentityClient } from './identity/Identity.client';
import { IdentityHTTPClient } from './identity/IdentityHTTP.client';
import { GraphQLClient } from './network/GraphQL.client';
import { FetchHTTPClient } from './network/FetchHTTP.client';
import { ExecutionModeService } from './service/ExecutionMode.service';
import { TaskService } from './service/Task.service';

export interface Deps {
    taskService: TaskService;
    executionModeService: ExecutionModeService;
    identityClient: IdentityClient;
}

export function initDeps(): Deps {
    const env = getEnvironment();
    let httpClient = new FetchHTTPClient();
    const identityClient = new IdentityClient(env, httpClient);
    httpClient = new IdentityHTTPClient(identityClient, httpClient);
    const config = getConfig(env);
    const teamyGraphQLClient = new GraphQLClient(
        httpClient,
        config.teamyGraphQLEndpoint,
    );
    const taskService = new TaskService(teamyGraphQLClient);
    const executionModeService = new ExecutionModeService(teamyGraphQLClient);
    return {
        taskService,
        executionModeService,
        identityClient,
    };
}
