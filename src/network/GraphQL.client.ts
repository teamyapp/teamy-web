import { HTTPClient } from './HTTP.client';
import {
    ApolloClient,
    InMemoryCache,
    gql,
    NormalizedCacheObject,
    DocumentNode,
    MutationOptions,
    QueryOptions
} from "@apollo/client";
import Cookies from 'js-cookie';

interface GQLJSONResponse<Data> {
    data: Data;
}

export class GraphQLClient {
    private readonly httpClient: HTTPClient;
    private readonly graphQLEndpoint: string;
    client: ApolloClient<NormalizedCacheObject>;

    constructor(httpClient: HTTPClient, graphQLEndpoint: string) {
        this.httpClient = httpClient;
        this.graphQLEndpoint = graphQLEndpoint;
        this.client = new ApolloClient({
            uri: graphQLEndpoint,
            cache: new InMemoryCache(),
            headers: {
                "Authorization": `Bearer ${Cookies.get("accessToken")}`
            }
        });
    }

    async mutate(options: MutationOptions): Promise<any> {
        const result = await this.client.mutate(options)
        return result.data
    }

    async query<Payload>(query: QueryOptions): Promise<any> {
        const result = await this.client.query(query)
        return result.data

        // const [payload, error] = await this.httpClient.request(
        //     this.graphQLEndpoint,
        //     {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify(body),
        //     },
        // );
        // if (error) {
        //     // TODO: handle error correctly
        //     return null;
        // }
        // const json: GQLJSONResponse<Payload> = JSON.parse(payload!);
        // return json?.data;
    }
}
