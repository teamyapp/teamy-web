import { FetchPolicy } from '@apollo/client';
import * as queries from './queries';
import { User } from '@entity/user';
import { GraphQLClient } from '@network/GraphQL.client';

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
