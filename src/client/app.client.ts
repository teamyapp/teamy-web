import { GraphQLClient } from '@lib/network/GraphQL.client';

import {
    RemoteCreateAppSecretInput,
    RemoteCreateAppVersionInput,
} from '@core/client/entity/input';

import { RemoteAppSecret } from './entity/remoteAppSecret';
import { RemoteAppVersion } from './entity/remoteAppVersion';
import { RemoteTag } from './entity/remoteTag';

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

    addTagToApp(appId: string, tag: string): Promise<RemoteTag> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation addTagToApp($appId: ID!, $tag: String!) {
                        addTagToApp(appId: $appId, tag: $tag) {
                            id
                            tag
                        }
                    }
                `,
                variables: {
                    appId,
                    tag,
                },
            })
            .then(({ addTagToApp }) => addTagToApp);

    }

    removeTagFromApp(appId: string, tagId: string): Promise<void> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation removeTagFromApp($appId: ID!, $tagId: ID!) {
                        removeTagFromApp(appId: $appId, tagId: $tagId) {
                            id
                            tag
                        }
                    }
                `,
                variables: {
                    appId,
                    tagId,
                },
            })
            .then(({ removeTagFromApp }) => removeTagFromApp);
    }


}
