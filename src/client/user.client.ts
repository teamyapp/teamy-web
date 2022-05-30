import { gql } from '@apollo/client';

import { GraphQLClient } from '@lib/network/GraphQL.client';

import { RemoteUser } from '@core/client/entity/remoteUser';
import { CreateUserInput, UpdateUserInput } from '@core/entity/input';

export class UserClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public getMeWithTeams(): Promise<RemoteUser> {
        return this.graphQLClient
            .query({
                query: gql`
                    query getMeWithTeams {
                        me {
                            id
                            firstName
                            lastName
                            profileUrl
                            createdAt
                            teams {
                                id
                                name
                                iconUrl
                                owner {
                                    id
                                }
                            }
                        }
                    }
                `,
            })
            .then((payload: any) => payload?.getMeWithTeams);
    }

    public getMe(): Promise<RemoteUser> {
        return this.graphQLClient
            .query({
                query: gql`
                    query getMe {
                        me {
                            id
                            firstName
                            lastName
                            profileUrl
                            createdAt
                        }
                    }
                `,
            })
            .then((payload: any) => payload?.getMe);
    }

    public createUser(input: CreateUserInput): Promise<RemoteUser> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
                    mutation createUser($input: CreateUserInput!) {
                        createUser(user: $input) {
                            id
                        }
                    }
                `,
                variables: {
                    input,
                },
            })
            .then((payload: any) => payload?.createUser);
    }

    public updateUser(
        userId: number,
        input: UpdateUserInput,
    ): Promise<RemoteUser> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
                    mutation updateTask(
                        $userId: ID!
                        $input: UpdateUserInput!
                    ) {
                        updateUser(userId: $userId, input: $input) {
                            id
                        }
                    }
                `,
                variables: {
                    userId,
                    input,
                },
            })
            .then((payload: any) => payload?.updateUser);
    }
}
