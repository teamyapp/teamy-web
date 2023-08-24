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
