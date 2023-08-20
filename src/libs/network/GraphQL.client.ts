import { HTTPClient } from './HTTP.client';

interface QueryOptions {
    query: string;
    operationName?: string;
    variables?: Record<string, any>;
}

interface MutateOptions {
    mutation: string;
    operationName?: string;
    variables?: Record<string, any>;
}

export class GraphQLClient {
    constructor(
        private graphQLEndpoint: string,
        private httpClient: HTTPClient,
    ) {}

    async mutate(mutateOptions: MutateOptions): Promise<any> {
        const { mutation, ...others } = mutateOptions;
        const [result, httpError] = await this.httpClient.request(
            this.graphQLEndpoint,
            {
                method: 'POST',
                body: JSON.stringify({
                    query: mutation,
                    ...others,
                }),
            },
        );

        if (httpError) {
            console.error(httpError.errorCode);
            return;
        }

        const json = result?.body ? JSON.parse(result.body) : null;
        if (!json) {
            return;
        }

        if (json.errors) {
            // todo: should handle errors
            // suggestion: errors can be pushed to a channel
            // and we can handle errors in a coroutine as well
            // we can have 1 global error channel that an Error Alert Component subscribes to
            console.error(json.errors);
        }

        return json.data;
    }

    async query(queryOptions: QueryOptions): Promise<any> {
        const [result, httpError] = await this.httpClient.request(
            this.graphQLEndpoint,
            {
                method: 'POST',
                body: JSON.stringify(queryOptions),
            },
        );

        if (httpError) {
            console.error(httpError.errorCode);
            return;
        }

        const json = result?.body ? JSON.parse(result.body) : null;
        if (!json) {
            return;
        }

        if (json.errors) {
            // todo: should handle errors
            // suggestion: errors can be pushed to a channel
            // and we can handle errors in a coroutine as well
            // we can have 1 global error channel that an Error Alert Component subscribes to
            console.error(json.errors);
        }

        return json.data;
    }
}
