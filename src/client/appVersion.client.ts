import { print } from 'graphql';
import { GraphQLClient } from '@lib/network/GraphQL.client';

import { RemoteAppVersion } from '@core/client/entity/remoteAppVersion';

import { RemoteUpdateAppVersionInput } from './entity/input';
import createAppVersion from "./graphql/mutation/createAppVersion.graphql"
import updateAppVersion from "./graphql/mutation/updateAppVersion.graphql"
import finishAppPackageUploadSession from "./graphql/mutation/finishAppPackageUploadSession.graphql"

export class AppVersionClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    createAppVersion(appId: string): Promise<RemoteAppVersion> {
        return this.graphQLClient
            .mutate({
                mutation: print(createAppVersion),
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
                mutation: print(updateAppVersion),
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
                mutation: print(finishAppPackageUploadSession),
                variables: {
                    appId,
                    versionNumber,
                    fileUploadSessionId,
                },
            })
            .then((payload: any) => payload?.finishAppPackageUploadSession);
    }
}
