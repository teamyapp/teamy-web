import { getConfig } from './config/config';
import { getEnvironment } from './env/environment';
import { IdentityClient } from './identity/Identity.client';
import { IdentityHTTPClient } from './identity/IdentityHTTP.client';
import { GraphQLClient } from './network/GraphQL.client';
import { FetchHTTPClient } from './network/FetchHTTP.client';
import { ExecutionModeService } from './service/ExecutionMode.service';

interface Deps {
    executionModeService: ExecutionModeService;
}

export function initDeps(): Deps {
    const env = getEnvironment();
    const identityClient = new IdentityClient(env);
    let httpClient = new FetchHTTPClient();
    httpClient = new IdentityHTTPClient(identityClient, httpClient);
    const config = getConfig(env);
    const teamyGraphQLClient = new GraphQLClient(
        httpClient,
        config.teamyGraphQLEndpoint,
    );
    const executionModeService = new ExecutionModeService(teamyGraphQLClient);
    return {
        executionModeService,
    };
}
