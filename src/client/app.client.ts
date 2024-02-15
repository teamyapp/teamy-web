import { GraphQLClient } from '@lib/network/GraphQL.client';

import {
    RemoteCreateAppInput,
    RemoteCreateAppSecretInput,
    RemoteCreateAppVersionInput,
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
    RemoteUpdateGroupInput,
    RemoteUpdateRolloutInput,
    RemoteUpdateVersionSelectorInput,
} from '@core/client/entity/input';
import { AppRolloutType } from '@core/entity/rollout';

import { RemoteAppSecret } from './entity/remoteAppSecret';
import { RemoteAppVersion } from './entity/remoteAppVersion';
import { RemoteGroup } from './entity/remoteGroup';
import { RemoteRollout } from './entity/remoteRollout';
import { RemoteRolloutActivator } from './entity/remoteRolloutActivator';
import { RemoteRolloutVersionSelector } from './entity/remoteRolloutVersionSelector';
import { RemoteTag } from './entity/remoteTag';
import { RemoteApp } from './entity/remoteApp';

export class AppClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    createApp(
        teamId: string,
        input: RemoteCreateAppInput,
    ): Promise<RemoteApp> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation createApp($teamId: ID!, $input: CreateAppInput!) {
                        createApp(teamId: $teamId, input: $input) {
                            id
                            tags {
                                id
                                value
                            }
                            secrets {
                                id
                                name
                                addedAt
                                addedBy {
                                    id
                                }
                                app {
                                    id
                                }
                            }
                            totalInstallations
                            installations {
                                id
                                installedTeam {
                                    id
                                }
                                activeAppVersion {
                                    app {
                                        id
                                    }
                                    number
                                }
                            }
                            latestVersionForTeam(teamId: $teamId) {
                                app {
                                    id
                                }
                                number
                                appName
                                description
                                changes
                                prices {
                                    amount
                                    currency
                                }
                                createdAt
                                createdBy {
                                    id
                                }
                                isReady
                                iconUrl
                            }
                            versions {
                                app {
                                    id
                                }
                                number
                                appName
                                description
                                changes
                                prices {
                                    amount
                                    currency
                                }
                                createdAt
                                createdBy {
                                    id
                                }
                                isReady
                                iconUrl
                            }
                            managedByTeam {
                                id
                                managedApps {
                                    id
                                }
                            }
                            groups {
                                id
                                type
                                memberType
                                name
                                locked
                                ... on StaticUserGroup{
                                    users {
                                        id
                                    }
                                }
                                ... on StaticTeamGroup{
                                    teams {
                                        id
                                    }
                                }
                                ... on FilterGroup {
                                    filter
                                }
                                createdAt
                                updatedAt
                                groupRolloutRelations {
                                    group {
                                        id
                                    }
                                    rollout {
                                        id
                                    }
                                    orderIndex
                                }
                                apps {
                                    id
                                }
                            }
                            userRollouts {
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
                            teamRollouts {
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
                    }
                `,
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
                mutation: `
                    mutation createStaticUserGroup($appId: ID!, $input: CreateStaticUserGroupInput!) {
                        createStaticUserGroup(appId: $appId, input: $input) {
                            id
                            type
                            locked
                            memberType
                            name
                            users {
                                id
                            }
                            createdAt
                            updatedAt
                            groupRolloutRelations {
                                group {
                                    id
                                }
                                rollout {
                                    id
                                }
                                orderIndex
                            }
                            apps {
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
            .then(({ createStaticUserGroup }) => createStaticUserGroup);
    }

    createStaticTeamGroup(
        appId: string,
        input: RemoteCreateStaticTeamGroupInput,
    ): Promise<RemoteGroup> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation createStaticTeamGroup($appId: ID!, $input: CreateStaticTeamGroupInput!) {
                        createStaticTeamGroup(appId: $appId, input: $input) {
                            id
                            type
                            locked
                            memberType
                            name
                            teams {
                                id
                            }
                            createdAt
                            updatedAt
                            groupRolloutRelations {
                                group {
                                    id
                                }
                                rollout {
                                    id
                                }
                                orderIndex
                            }
                            apps {
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
            .then(({ createStaticTeamGroup }) => createStaticTeamGroup);
    }

    createFilterGroup(
        appId: string,
        input: RemoteCreateFilterGroupInput,
    ): Promise<RemoteGroup> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation createFilterGroup($appId: ID!, $input: CreateFilterGroupInput!) {
                        createFilterGroup(appId: $appId, input: $input) {
                            id
                            type
                            locked
                            memberType
                            name
                            filter
                            createdAt
                            updatedAt
                            groupRolloutRelations {
                                group {
                                    id
                                }
                                rollout {
                                    id
                                }
                                orderIndex
                            }
                            apps {
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
            .then(({ createFilterGroup }) => createFilterGroup);
    }

    updateGroup(
        appId: string,
        groupId: string,
        input: RemoteUpdateGroupInput,
    ): Promise<RemoteGroup> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation updateGroup($appId: ID!, $groupId: ID!, $input: UpdateGroupInput!) {
                        updateGroup(appId: $appId, groupId: $groupId, input: $input) {
                            id
                            type
                            locked
                            memberType
                            name
                            ... on StaticUserGroup{
                                users {
                                    id
                                }
                            }
                            ... on StaticTeamGroup{
                                teams {
                                    id
                                }
                            }
                            ... on FilterGroup {
                                filter
                            }
                            createdAt
                            updatedAt
                            groupRolloutRelations {
                                group {
                                    id
                                }
                                rollout {
                                    id
                                }
                                orderIndex
                            }
                            apps {
                                id
                            }
                        }
                    }
                `,
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
                        createExperimentVersionSelector(input: $input) {
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
}
