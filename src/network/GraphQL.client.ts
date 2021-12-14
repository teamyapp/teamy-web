import {
    ApolloClient,
    InMemoryCache,
    NormalizedCacheObject,
    MutationOptions,
    QueryOptions
} from "@apollo/client";

interface AccessTokenGetter {
    getAccessToken(): string
}

export class GraphQLClient {
    client: ApolloClient<NormalizedCacheObject>;

    constructor(tokenGetter: AccessTokenGetter, graphQLEndpoint: string) {
        this.client = new ApolloClient({
            uri: graphQLEndpoint,
            cache: new InMemoryCache(),
            headers: {
                "Authorization": `Bearer ${tokenGetter.getAccessToken()}`
            }
        });
    }

    async mutate(options: MutationOptions): Promise<any> {
        const result = await this.client.mutate(options)
        return result.data
    }

    async query(query: QueryOptions): Promise<any> {
        const result = await this.client.query(query)
        return result.data
    }
}
