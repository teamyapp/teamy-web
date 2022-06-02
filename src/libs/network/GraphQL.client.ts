import {
    ApolloClient,
    InMemoryCache,
    MutationOptions,
    NormalizedCacheObject,
    QueryOptions,
} from '@apollo/client';

interface AccessTokenGetter {
    getAccessToken(): string;
}

export class GraphQLClient {
    private readonly tokenGetter: AccessTokenGetter;
    private readonly client: ApolloClient<NormalizedCacheObject>;

    constructor(tokenGetter: AccessTokenGetter, graphQLEndpoint: string) {
        this.tokenGetter = tokenGetter;
        this.client = new ApolloClient({
            uri: graphQLEndpoint,
            cache: new InMemoryCache(),
        });
    }

    async mutate(options: MutationOptions): Promise<any> {
        options.errorPolicy = 'all';
        options.context = this.getAuthContext();
        const result = await this.client.mutate(options);
        if (result.errors) {
            // todo: should handle errors
            // suggestion: errors can be pushed to a channel
            // and we can handle errors in a coroutine as well
            // we can have 1 global error channel that an Error Alert Component subscribes to
            console.error(result.errors);
        }
        return result.data;
    }

    async query(options: QueryOptions): Promise<any> {
        options.fetchPolicy = 'network-only';
        options.errorPolicy = 'all';
        options.context = this.getAuthContext();
        const result = await this.client.query(options);
        if (result.errors) {
            // todo: should handle errors
            // suggestion: errors can be pushed to a channel
            // and we can handle errors in a coroutine as well
            // we can have 1 global error channel that an Error Alert Component subscribes to
            console.error(result.errors);
        }
        return result.data;
    }

    private getAuthContext() {
        return {
            headers: {
                Authorization: `Bearer ${this.tokenGetter.getAccessToken()}`,
            },
        };
    }
}
