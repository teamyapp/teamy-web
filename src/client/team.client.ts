import { GraphQLClient } from '@lib/network/GraphQL.client';

import { RemoteTaskFilter } from '@core/client/entity/filter';
import {
    RemoteCreateTeamInput,
    RemoteUpdateTeamInput,
} from '@core/client/entity/input';
import { RemoteTeam } from '@core/client/entity/remoteTeam';

export class TeamClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    // TODO: simplify query(app version part) once we have apps query
    public getTeamWithSprintPreviews(teamId: string): Promise<RemoteTeam> {
        return this.graphQLClient
            .query({
                query: `
                    query getTeam($teamId: ID!) {
                        teams(filter: { teamId: $teamId }) {
                            id
                            iconUrl
                            activeSprint {
                                id
                            }
                            taskActivities {
                                taskId
                                dragTaskActivity {
                                    isDragging
                                    client {
                                        id
                                        user {
                                            id
                                            firstName
                                            lastName
                                        }
                                    }
                                }
                            }
                            appInstallations {
                                id
                                installedTeam {
                                    id
                                }
                                activeAppVersion {
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
                                    locked
                                    iconUrl
                                }
                            }
                            managedApps {
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
                                    locked
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
                                    locked
                                    iconUrl
                                }
                                managedByTeam {
                                    id
                                }
                                groups {
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
                            sprints {
                                id
                                startAt
                                endAt
                                owningTeam {
                                    id
                                }
                            }
                        }
                    }
                `,
                variables: {
                    teamId,
                },
            })
            .then((payload: any) => payload?.teams[0]);
    }

    public getTeamWithTaskPreviews(
        teamId: string,
        taskFilter?: RemoteTaskFilter,
    ): Promise<RemoteTeam> {
        return this.graphQLClient
            .query({
                query: `
                    query getTeam($teamId: ID!, $taskFilter: TaskFilter) {
                        teams(filter: { teamId: $teamId }) {
                            id
                            tasks(filter: $taskFilter) {
                                id
                                goal
                                dueAt
                                status
                                isPlanned
                                effort
                                priority
                                owner {
                                    id
                                    firstName
                                    lastName
                                    profileUrl
                                }
                                owningTeam {
                                    id
                                }
                                awaitForTasks {
                                    id
                                    goal
                                    context
                                    status
                                    isPlanned
                                    effort
                                    priority
                                    owningTeam {
                                        id
                                    }
                                }
                                links {
                                    id
                                    taskId
                                    title
                                    url
                                    iconUrl
                                    iconHoverUrl
                                }
                            }
                        }
                    }
                `,
                variables: {
                    teamId,
                    taskFilter,
                },
            })
            .then((payload: any) => payload?.teams[0]);
    }

    public createTeam(team: RemoteCreateTeamInput): Promise<RemoteTeam> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation createTeam($input: CreateTeamInput!) {
                        createTeam(team: $input) {
                            id
                            name
                            iconUrl
                            owner {
                                id
                            }
                            members {
                                user {
                                    id
                                }
                            }
                            activeSprint {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    input: team,
                },
            })
            .then((payload: any) => payload?.createTeam);
    }

    public updateTeam(
        teamId: string,
        input: RemoteUpdateTeamInput,
    ): Promise<RemoteTeam> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation updateTeam(
                        $teamId: ID!
                        $input: UpdateTeamInput!
                    ) {
                        updateTeam(teamId: $teamId, input: $input) {
                            id
                            name
                            iconUrl
                            activeSprint {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    teamId,
                    input,
                },
            })
            .then((payload: any) => payload?.updateTeam);
    }

    public updateTeamActiveSprint(teamId: string, sprintId: string) {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation updateTeamActiveSprint(
                        $teamId: ID!
                        $sprintId: ID!
                    ) {
                        updateTeamActiveSprint(
                            teamId: $teamId
                            sprintId: $sprintId
                        ) {
                            id
                            name
                            iconUrl
                            activeSprint {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    teamId,
                    sprintId,
                },
            })
            .then((payload: any) => payload?.updateTeamActiveSprint);
    }

    public deleteTeam(teamId: string): Promise<RemoteTeam> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation deleteTeam($teamId: ID!) {
                        deleteTeam(teamId: $teamId) {
                            id
                        }
                    }
                `,
                variables: {
                    teamId,
                },
            })
            .then((payload: any) => payload?.deleteTeam);
    }

    public createTeamIconUploadSession(teamId: string): Promise<string> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation createTeamIconUploadSession($teamId: ID!) {
                        createTeamIconUploadSession(teamId: $teamId)
                    }
                `,
                variables: {
                    teamId,
                },
            })
            .then((payload: any) => payload?.createTeamIconUploadSession);
    }

    public finishTeamIconUploadSession(
        teamId: string,
        fileUploadSessionId: string,
    ): Promise<RemoteTeam> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation finishTeamIconUploadSession(
                        $teamId: ID!
                        $fileUploadSessionId: ID!
                    ) {
                        finishTeamIconUploadSession(
                            teamId: $teamId
                            fileUploadSessionId: $fileUploadSessionId
                        ) {
                            id
                            iconUrl
                        }
                    }
                `,
                variables: {
                    teamId,
                    fileUploadSessionId,
                },
            })
            .then((payload: any) => payload?.finishTeamIconUploadSession);
    }
}
