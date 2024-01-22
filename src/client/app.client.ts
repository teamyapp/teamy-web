import { GraphQLClient } from '@lib/network/GraphQL.client';

import {
    RemoteCreateAppSecretInput,
    RemoteCreateAppVersionInput,
} from '@core/client/entity/input';

import { RemoteAppSecret } from './entity/remoteAppSecret';
import { RemoteAppVersion } from './entity/remoteAppVersion';

export class AppClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    createAppVersion(
        appId: string,
        input: RemoteCreateAppVersionInput,
    ): Promise<RemoteAppVersion> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation createAppVersion($appId: ID!, $input: CreateAppVersionInput!) {
                        createAppVersion(appId: $appId, input: $input) {
                            number
                            appName
                            description
                            createdAt
                            createdBy {
                                id
                            }
                            app {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    appId,
                    input,
                },
            })
            .then(({ createAppVersion }) => createAppVersion);
    }

    deleteAppVersion(appId: string, versionNumber: number): Promise<void> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation deleteAppVersion($appId: ID!, $versionNumber: Int!) {
                        deleteAppVersion(appId: $appId, versionNumber: $versionNumber) {
                            number
                        }
                    }
                `,
                variables: {
                    appId,
                    versionNumber,
                },
            })
            .then(({ deleteAppVersion }) => deleteAppVersion);
    }

    createAppSecret(
        appId: string,
        input: RemoteCreateAppSecretInput,
    ): Promise<RemoteAppSecret> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation createAppSecret($appId: ID!, $input: CreateAppSecretInput!) {
                        createAppSecret(appId: $appId, input: $input) {
                            id
                            name
                            addedAt
                            addedBy {
                                id
                                firstName
                                lastName
                                profileUrl
                            }
                            lastUsedAt
                            app {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    appId,
                    input,
                },
            })
            .then(({ createAppSecret }) => createAppSecret);
    }

    deleteAppSecret(secretId: string): Promise<void> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation deleteAppSecret($secretId: ID!) {
                        deleteAppSecret(secretId: $secretId) {
                            id
                        }
                    }
                `,
                variables: {
                    secretId,
                },
            })
            .then(({ deleteAppSecret }) => deleteAppSecret);
    }
}
