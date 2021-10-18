import { HTTPClient } from './HTTP.client';

interface GQLJSONResponse<Data> {
    data: Data;
}

export class GraphQLClient {
    private readonly httpClient: HTTPClient;
    private readonly graphQLEndpoint: string;

    constructor(httpClient: HTTPClient, graphQLEndpoint: string) {
        this.httpClient = httpClient;
        this.graphQLEndpoint = graphQLEndpoint;
    }

    query<Payload>(query: string, variables?: any): Promise<any> {
        const body = {
            query: query,
            variables: variables,
        };

        return this.httpClient
            .request(this.graphQLEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })
            .then(JSON.parse)
            .then((json: GQLJSONResponse<Payload>) => json.data);
    }
}
