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

    async query<Payload>(query: string, variables?: any): Promise<any> {
        const body = {
            query: query,
            variables: variables,
        };

        const [payload, error] = await this.httpClient.request(
            this.graphQLEndpoint,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            },
        );
        if (error) {
            // TODO: handle error correctly
            return null;
        }
        const json: GQLJSONResponse<Payload> = JSON.parse(payload!);
        return json?.data;
    }
}
