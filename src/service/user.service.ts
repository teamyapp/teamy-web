import { FetchPolicy } from '@apollo/client';

import { GraphQLClient } from '@lib/network/GraphQL.client';

import { CreateUserInput } from '@core/entity/input';
import { User } from '@core/entity/user';

import * as mutations from './mutations';
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

    public createUser(user: CreateUserInput): Promise<void> {
        return this.graphQLClient.mutate({
            mutation: mutations.createUser,
            variables: {
                input: user,
            },
        });
    }

    public updateUser(user: User): Promise<void> {
        return this.graphQLClient.mutate({
            mutation: mutations.updateUser,
            variables: {
                userId: user.id,
                userInput: user,
            },
        });
    }
}
