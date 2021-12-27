import {
    ApolloClient,
    InMemoryCache,
    NormalizedCacheObject,
    MutationOptions,
    QueryOptions,
} from '@apollo/client';

interface AccessTokenGetter {
    getAccessToken(): string;
}

export class GraphQLClient {
    client: ApolloClient<NormalizedCacheObject>;

    constructor(tokenGetter: AccessTokenGetter, graphQLEndpoint: string) {
        this.client = new ApolloClient({
            uri: graphQLEndpoint,
            cache: new InMemoryCache(),
            headers: {
                Authorization: `Bearer ${tokenGetter.getAccessToken()}`,
            },
        });
    }

    async mutate(options: MutationOptions): Promise<any> {
        options.errorPolicy = 'all';
        const result = await this.client.mutate(options);
        if(result.errors) {
            // todo: should handle errors
            // suggestion: errors can be pushed to a channel
            // and we can handle errors in a coroutine as well
            // we can have 1 global error channel that an Error Alert Component subscribes to
            console.info(result.errors)
        }
        return result.data;
    }

    async query(query: QueryOptions): Promise<any> {
        query.errorPolicy = 'all';
        const result = await this.client.query(query);
        return result.data;
    }
}
