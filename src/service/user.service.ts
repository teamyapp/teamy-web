import { FetchPolicy } from '@apollo/client';

import { GraphQLClient } from '@lib/network/GraphQL.client';

import { User } from '@core/entity/user';

import * as queries from './queries';

export class UserService {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public fetchMe(policy: FetchPolicy): Promise<User> {
        return this.graphQLClient
            .query({ query: queries.me, fetchPolicy: policy })
            .then((payload: any) => {
                return payload?.me;
            });
    }
}
