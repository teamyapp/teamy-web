import { print } from 'graphql';

import { GraphQLClient } from '@lib/network/GraphQL.client';

import { RemoteUser } from '@core/client/entity/remoteUser';
import { CreateUserInput, UpdateUserInput } from '@core/entity/input';

import createUser from './graphql/mutation/createUser.graphql';
import finishUserProfileUploadSession from './graphql/mutation/finishUserProfileUploadSession.graphql';
import updateUser from './graphql/mutation/updateUser.graphql';
import getMe from './graphql/query/getMe.graphql';
import getMeWithTeams from './graphql/query/getMeWithTeams.graphql';
import getUserWithTeams from './graphql/query/getUserWithTeams.graphql';

export class UserClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public getUser(userId: string): Promise<RemoteUser> {
        return this.graphQLClient
            .query({
                query: print(getUserWithTeams),
                variables: {
                    userId,
                },
            })
            .then((payload: any) => payload?.user);
    }

    public getMeWithTeams(): Promise<RemoteUser> {
        return this.graphQLClient
            .query({
                query: print(getMeWithTeams),
            })
            .then((payload: any) => payload?.me);
    }

    public getMe(): Promise<RemoteUser> {
        return this.graphQLClient
            .query({
                query: print(getMe),
            })
            .then((payload: any) => payload?.me);
    }

    public createUser(input: CreateUserInput): Promise<RemoteUser> {
        return this.graphQLClient
            .mutate({
                mutation: print(createUser),
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
                mutation: print(updateUser),
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
                mutation: `
                    mutation createUserProfileUploadSession {
                        createUserProfileUploadSession
                    }
                `,
            })
            .then((payload: any) => payload?.createUserProfileUploadSession);
    }

    public finishUserProfileUploadSession(
        fileUploadSessionId: string,
    ): Promise<RemoteUser> {
        return this.graphQLClient
            .mutate({
                mutation: print(finishUserProfileUploadSession),
                variables: {
                    fileUploadSessionId,
                },
            })
            .then((payload: any) => payload?.finishUserProfileUploadSession);
    }
}
