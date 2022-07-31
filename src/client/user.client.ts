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
                            updatedAt
                            teams {
                                id
                                name
                                iconUrl
                                owner {
                                    id
                                }
                                members {
                                    id
                                    firstName
                                    lastName
                                }
                            }
                        }
                    }
                `,
            })
            .then((payload: any) => payload?.me);
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
                            updatedAt
                        }
                    }
                `,
            })
            .then((payload: any) => payload?.me);
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
        userId: string,
        input: UpdateUserInput,
    ): Promise<RemoteUser> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
                    mutation updateUser(
                        $userId: ID!
                        $input: UpdateUserInput!
                    ) {
                        updateUser(userId: $userId, input: $input) {
                            id
                            firstName
                            lastName
                            profileUrl
                            updatedAt
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

    public createUserProfileUploadSession(): Promise<string> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
                    mutation createUserProfileUploadSession {
                        createUserProfileUploadSession
                    }
                `,
            })
            .then((payload: any) => payload?.createUserProfileUploadSession);
    }

    public finishUserProfileUploadSession(
        fileUploadSessionId: string,
    ): Promise<string> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
                    mutation finishUserProfileUploadSession(
                        $fileUploadSessionId: ID!
                    ) {
                        finishUserProfileUploadSession(
                            fileUploadSessionId: $fileUploadSessionId
                        )
                    }
                `,
                variables: {
                    fileUploadSessionId,
                },
            })
            .then((payload: any) => payload?.finishUserProfileUploadSession);
    }
}
