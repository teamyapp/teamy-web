import { GraphQLClient } from './network/GraphQL.client';
import { FetchHTTPClient } from './network/FetchHTTP.client';
import { HTTPWithIdentity } from './network/HTTPWithIdentity';
import { ExecutionModeService } from './service/ExecutionMode.service';

interface Deps {
    executionModeService: ExecutionModeService;
}

export function initDeps(): Deps {
    const httpClient = new HTTPWithIdentity(new FetchHTTPClient());
    const graphQLClient = new GraphQLClient(
        httpClient,
        'http://localhost:9000/graphql',
    );
    const executionModeService = new ExecutionModeService(graphQLClient);
    return {
        executionModeService,
    };
}
