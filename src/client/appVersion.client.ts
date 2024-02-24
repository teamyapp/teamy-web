import { GraphQLClient } from '@lib/network/GraphQL.client';

import { RemoteAppVersion } from '@core/client/entity/remoteAppVersion';

import { RemoteUpdateAppVersionInput } from './entity/input';

export class AppVersionClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    createAppVersion(appId: string): Promise<RemoteAppVersion> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation createAppVersion($appId: ID!) {
                        createAppVersion(appId: $appId) {
                            number
                            createdBy {
                                id
                            }
                            app {
                                id
                            }
                            status
                            errorMessage
                        }
                    }
                `,
                variables: {
                    appId,
                },
            })
            .then(({ createAppVersion }) => createAppVersion);
    }

    updateAppVersion(
        appId: string,
        versionNumber: number,
        input: RemoteUpdateAppVersionInput,
    ): Promise<RemoteAppVersion> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation updateAppVersion(
                        $appId: ID!
                        $versionNumber: Int!
                        $input: UpdateAppVersionInput!
                    ) {
                        updateAppVersion(
                            appId: $appId
                            versionNumber: $versionNumber
                            input: $input
                        ) {
                            number
                            locked
                            status
                            errorMessage
                            app {
                                id
                            }
                            changes
                            prices {
                                currency
                                amount
                            }
                            createdBy {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    appId,
                    versionNumber,
                    input,
                },
            })
            .then(({ updateAppVersion }) => updateAppVersion);
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

    public createAppPackageUploadSession(
        appId: string,
        versionNumber: number,
    ): Promise<string> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation createAppPackageUploadSession (
                        $appId: ID!
                        $versionNumber: Int!
                    ) {
                        createAppPackageUploadSession(
                            appId: $appId
                            versionNumber: $versionNumber
                        )
                    }
                `,
                variables: {
                    appId,
                    versionNumber,
                },
            })
            .then((payload: any) => payload?.createAppPackageUploadSession);
    }

    public finishAppPackageUploadSession(
        appId: string,
        versionNumber: number,
        fileUploadSessionId: string,
    ): Promise<RemoteAppVersion> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation finishAppPackageUploadSession(
                        $appId: ID!
                        $versionNumber: Int!
                        $fileUploadSessionId: ID!
                    ) {
                        finishAppPackageUploadSession(
                            appId: $appId
                            versionNumber: $versionNumber
                            fileUploadSessionId: $fileUploadSessionId
                        ) {
                            number
                            status
                            changes
                            prices {
                                currency
                                amount
                            }
                            errorMessage
                            app {
                                id
                            }
                            createdBy {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    appId,
                    versionNumber,
                    fileUploadSessionId,
                },
            })
            .then((payload: any) => payload?.finishAppPackageUploadSession);
    }
}
