import { FetchPolicy } from '@apollo/client';

import { GraphQLClient } from '@lib/network/GraphQL.client';

import * as queries from '@core/service/queries';

export class PageService {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public async fetchMePage(policy: FetchPolicy): Promise<any> {
        return await this.graphQLClient.query({
            fetchPolicy: policy,
            query: queries.myDataOfInterests,
        });
    }
}
