import { print } from 'graphql';

import { GraphQLClient } from '@lib/network/GraphQL.client';

import {
    RemoteAppFilter,
    RemoteCreateAppInput,
    RemoteCreateAppSecretInput,
    RemoteCreateExperimentVersionSelectorInput,
    RemoteCreateFilterGroupInput,
    RemoteCreateMaxViewersActivatorInput,
    RemoteCreatePercentageActivatorInput,
    RemoteCreateRolloutInput,
    RemoteCreateStaticTeamGroupInput,
    RemoteCreateStaticUserGroupInput,
    RemoteCreateStaticVersionSelectorInput,
    RemoteCreateTimeRangeActivatorInput,
    RemoteUpdateActivatorInput,
    RemoteUpdateAppSecretInput,
    RemoteUpdateGroupInput,
    RemoteUpdateRolloutInput,
    RemoteUpdateVersionSelectorInput,
} from '@core/client/entity/input';
import { AppRolloutType } from '@core/entity/rollout';

import { RemoteApp } from './entity/remoteApp';
import { RemoteAppInstallation } from './entity/remoteAppInstallation';
import { RemoteAppSecret } from './entity/remoteAppSecret';
import { RemoteGroup } from './entity/remoteGroup';
import { RemoteRollout } from './entity/remoteRollout';
import { RemoteRolloutActivator } from './entity/remoteRolloutActivator';
import { RemoteRolloutVersionSelector } from './entity/remoteRolloutVersionSelector';
import { RemoteTag } from './entity/remoteTag';
import createApp from './graphql/mutation/createApp.graphql';
import createFilterGroup from './graphql/mutation/createFilterGroup.graphql';
import createStaticTeamGroup from './graphql/mutation/createStaticTeamGroup.graphql';
import createStaticUserGroup from './graphql/mutation/createStaticUserGroup.graphql';
import updateGroup from './graphql/mutation/updateGroup.graphql';
import getApps from './graphql/query/getApps.graphql';

export class AppClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    getApps(teamId: string, filter?: RemoteAppFilter): Promise<RemoteApp[]> {
        return this.graphQLClient
            .query({
                query: print(getApps),
                variables: {
                    teamId,
                    filter,
                },
            })
            .then(({ apps }) => apps);
    }

    createApp(teamId: string, input: RemoteCreateAppInput): Promise<RemoteApp> {
        return this.graphQLClient
            .mutate({
                mutation: print(createApp),
                variables: {
                    teamId,
                    input,
                },
            })
            .then(({ createApp }) => createApp);
    }

    deleteApp(appId: string): Promise<RemoteApp> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation deleteApp($appId: ID!) {
                        deleteApp(appId: $appId) {
                            id
                        }
                    }
                `,
                variables: {
                    appId,
                },
            })
            .then(({ deleteApp }) => deleteApp);
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
                            token
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

    updateAppSecret(
        secretId: string,
        input: RemoteUpdateAppSecretInput,
    ): Promise<RemoteAppSecret> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation updateAppSecret($secretId: ID!, $input: UpdateAppSecretInput!) {
                        updateAppSecret(secretId: $secretId, input: $input) {
                            id
                            name
                        }
                    }
                `,
                variables: {
                    secretId,
                    input,
                },
            })
            .then(({ updateAppSecret }) => updateAppSecret);
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

    addTagToApp(appId: string, value: string): Promise<RemoteTag> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation addTagToApp($appId: ID!, $value: String!) {
                        addTagToApp(appId: $appId, value: $value) {
                            id
                            value
                        }
                    }
                `,
                variables: {
                    appId,
                    value,
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
                            value
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

    createStaticUserGroup(
        appId: string,
        input: RemoteCreateStaticUserGroupInput,
    ): Promise<RemoteGroup> {
        return this.graphQLClient
            .mutate({
                mutation: print(createStaticUserGroup),
                variables: {
                    appId,
                    input,
                },
            })
            .then(({ createStaticUserGroup }) => createStaticUserGroup);
    }

    createStaticTeamGroup(
        appId: string,
        input: RemoteCreateStaticTeamGroupInput,
    ): Promise<RemoteGroup> {
        return this.graphQLClient
            .mutate({
                mutation: print(createStaticTeamGroup),
                variables: {
                    appId,
                    input,
                },
            })
            .then(({ createStaticTeamGroup }) => createStaticTeamGroup);
    }

    createFilterGroup(
        appId: string,
        input: RemoteCreateFilterGroupInput,
    ): Promise<RemoteGroup> {
        return this.graphQLClient
            .mutate({
                mutation: print(createFilterGroup),
                variables: {
                    appId,
                    input,
                },
            })
            .then(({ createFilterGroup }) => createFilterGroup);
    }

    updateGroup(
        appId: string,
        groupId: string,
        input: RemoteUpdateGroupInput,
    ): Promise<RemoteGroup> {
        return this.graphQLClient
            .mutate({
                mutation: print(updateGroup),
                variables: {
                    appId,
                    groupId,
                    input,
                },
            })
            .then(({ updateGroup }) => updateGroup);
    }

    deleteGroup(groupId: string): Promise<void> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation deleteGroup($groupId: ID!) {
                        deleteGroup(groupId: $groupId) {
                            id
                        }
                    }
                `,
                variables: {
                    groupId,
                },
            })
            .then(({ deleteAppGroup }) => deleteAppGroup);
    }

    createStaticActivator(): Promise<RemoteRolloutActivator> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation createStaticActivator {
                        createStaticActivator {
                            id
                            type
                            createdAt
                            updatedAt
                        }
                    }
                `,
            })
            .then(({ createStaticActivator }) => createStaticActivator);
    }

    createTimeRangeActivator(
        input: RemoteCreateTimeRangeActivatorInput,
    ): Promise<RemoteRolloutActivator> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation createTimeRangeActivator($input: CreateTimeRangeActivatorInput!) {
                        createTimeRangeActivator(input: $input) {
                            id
                            type
                            createdAt
                            updatedAt
                            startAt
                            endAt
                        }
                    }
                `,
                variables: {
                    input,
                },
            })
            .then(({ createTimeRangeActivator }) => createTimeRangeActivator);
    }

    createPercentageActivator(
        input: RemoteCreatePercentageActivatorInput,
    ): Promise<RemoteRolloutActivator> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation createPercentageActivator($input: CreatePercentageActivatorInput!) {
                        createPercentageActivator(input: $input) {
                            id
                            type
                            createdAt
                            updatedAt
                            percentage
                        }
                    }
                `,
                variables: {
                    input,
                },
            })
            .then(({ createPercentageActivator }) => createPercentageActivator);
    }

    createMaxViewersActivator(
        input: RemoteCreateMaxViewersActivatorInput,
    ): Promise<RemoteRolloutActivator> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation createMaxViewersActivator($input: CreateMaxViewersActivatorInput!) {
                        createMaxViewersActivator(input: $input) {
                            id
                            type
                            createdAt
                            updatedAt
                            maxViewers
                        }
                    }
                `,
                variables: {
                    input,
                },
            })
            .then(({ createMaxViewersActivator }) => createMaxViewersActivator);
    }

    updateActivator(
        activatorId: string,
        input: RemoteUpdateActivatorInput,
    ): Promise<RemoteRolloutActivator> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation updateActivator($activatorId: ID!, $input: UpdateActivatorInput!) {
                        updateActivator(activatorId: $activatorId, input: $input) {
                            id
                            type
                            createdAt
                            updatedAt
                            ... on TimeRangeActivator {
                                startAt
                                endAt
                            }
                            ... on MaxViewersActivator {
                                maxViewers
                            }
                            ... on PercentageActivator {
                                percentage
                            }
                        }
                    }
                `,
                variables: {
                    activatorId,
                    input,
                },
            })
            .then(({ updateActivator }) => updateActivator);
    }

    createStaticVersionSelector(
        appId: string,
        input: RemoteCreateStaticVersionSelectorInput,
    ): Promise<RemoteRolloutVersionSelector> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation createStaticVersionSelector($appId: ID!, $input: CreateStaticVersionSelectorInput!) {
                        createStaticVersionSelector(appId: $appId,  input: $input) {
                            id
                            type
                            createdAt
                            updatedAt
                            versionNumber
                        }
                    }
                `,
                variables: {
                    appId,
                    input,
                },
            })
            .then(
                ({ createStaticVersionSelector }) =>
                    createStaticVersionSelector,
            );
    }

    createExperimentVersionSelector(
        appId: string,
        input: RemoteCreateExperimentVersionSelectorInput,
    ): Promise<RemoteRolloutVersionSelector> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation createExperimentVersionSelector($appId: ID!, $input: CreateExperimentVersionSelectorInput!) {
                        createExperimentVersionSelector(appId: $appId, input: $input) {
                            id
                            type
                            createdAt
                            updatedAt
                            versionNumbers
                        }
                    }
                `,
                variables: {
                    appId,
                    input,
                },
            })
            .then(
                ({ createExperimentVersionSelector }) =>
                    createExperimentVersionSelector,
            );
    }

    updateVersionSelector(
        appId: string,
        versionSelectorId: string,
        input: RemoteUpdateVersionSelectorInput,
    ): Promise<RemoteRolloutVersionSelector> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation updateVersionSelector($appId: ID!, $versionSelectorId: ID!, $input: UpdateVersionSelectorInput!) {
                        updateVersionSelector(appId: $appId, versionSelectorId: $versionSelectorId, input: $input) {
                            id
                            type
                            createdAt
                            updatedAt
                            ... on StaticVersionSelector {
                                versionNumber
                            }
                            ... on ExperimentVersionSelector {
                                versionNumbers
                            }
                        }
                    }
                `,
                variables: {
                    appId,
                    versionSelectorId,
                    input,
                },
            })
            .then(({ updateVersionSelector }) => updateVersionSelector);
    }

    createAppRollout(
        appId: string,
        appRolloutType: AppRolloutType,
        input: RemoteCreateRolloutInput,
    ): Promise<RemoteRollout> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation createAppRollout($appId: ID!, $appRolloutType: AppRolloutType!, $input: CreateAppRolloutInput!) {
                        createAppRollout(appId: $appId, appRolloutType: $appRolloutType, input: $input) {
                            id
                            name
                            isEnabled
                            locked
                            activator {
                                id
                                type
                                createdAt
                                updatedAt
                                ... on TimeRangeActivator {
                                    startAt
                                    endAt
                                }
                                ... on MaxViewersActivator {
                                    maxViewers
                                }
                                ... on PercentageActivator {
                                    percentage
                                }
                            }
                            versionSelector {
                                id
                                type
                                ... on StaticVersionSelector {
                                    versionNumber
                                }
                                ... on ExperimentVersionSelector {
                                    versionNumbers
                                }
                            }
                            groupRolloutRelations {
                                group {
                                    id
                                }
                                rollout {
                                    id
                                }
                                orderIndex
                            }
                            createdAt
                            updatedAt
                        }
                    }
                `,
                variables: {
                    appId,
                    appRolloutType,
                    input,
                },
            })
            .then(({ createAppRollout }) => createAppRollout);
    }

    updateRollout(
        rolloutId: string,
        input: RemoteUpdateRolloutInput,
    ): Promise<RemoteRollout> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation updateRollout($rolloutId: ID!, $input: UpdateRolloutInput!) {
                        updateRollout(rolloutId: $rolloutId, input: $input) {
                            id
                            name
                            isEnabled
                            locked
                            activator {
                                id
                                type
                                createdAt
                                updatedAt
                                ... on TimeRangeActivator {
                                    startAt
                                    endAt
                                }
                                ... on MaxViewersActivator {
                                    maxViewers
                                }
                                ... on PercentageActivator {
                                    percentage
                                }
                            }
                            versionSelector {
                                id
                                type
                                ... on StaticVersionSelector {
                                    versionNumber
                                }
                                ... on ExperimentVersionSelector {
                                    versionNumbers
                                }
                            }
                            groupRolloutRelations {
                                group {
                                    id
                                }
                                rollout {
                                    id
                                }
                                orderIndex
                            }
                            createdAt
                            updatedAt
                        }
                    }
                `,
                variables: {
                    rolloutId,
                    input,
                },
            })
            .then(({ updateRollout }) => updateRollout);
    }

    deleteRollout(rolloutId: string): Promise<RemoteRollout> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation deleteRollout($rolloutId: ID!) {
                        deleteRollout(rolloutId: $rolloutId) {
                            id
                        }
                    }
                `,
                variables: {
                    rolloutId,
                },
            })
            .then(({ deleteRollout }) => deleteRollout);
    }

    installAppToTeam(
        appId: string,
        teamId: string,
    ): Promise<RemoteAppInstallation> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation installAppToTeam($appId: ID!, $teamId: ID!) {
                        installAppToTeam(appId: $appId, teamId: $teamId) {
                            id
                            installedTeam {
                                id
                            }
                            activeAppVersion {
                                app {
                                    id
                                    totalInstallations
                                }
                                number
                            }
                        }
                    }
                `,
                variables: {
                    appId,
                    teamId,
                },
            })
            .then(({ installAppToTeam }) => installAppToTeam);
    }

    uninstallAppFromTeam(
        installationId: string,
    ): Promise<RemoteAppInstallation> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation uninstallAppFromTeam($installationId: ID!) {
                        uninstallAppFromTeam(installationId: $installationId) {
                            id
                            installedTeam {
                                id
                            }
                            activeAppVersion {
                                app {
                                    id
                                    totalInstallations
                                }
                                number
                            }
                        }
                    }
                `,
                variables: {
                    installationId,
                },
            })
            .then(({ uninstallAppFromTeam }) => uninstallAppFromTeam);
    }
}
