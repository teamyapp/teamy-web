import { gql } from '@apollo/client';

import { GraphQLClient } from '@lib/network/GraphQL.client';

import { CreateSprintInput } from '@core/client/entity/input';
import { RemoteSprint } from '@core/client/entity/remoteSprint';
import { RemoteTask } from '@core/client/entity/remoteTask';

export class SprintClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public getSprintWithTaskPreviews(sprintId: string): Promise<RemoteSprint> {
        return this.graphQLClient
            .query({
                query: gql`
                    query getSprint($sprintId: ID!) {
                        sprints(filter: { sprintId: $sprintId }) {
                            id
                            startAt
                            endAt
                            owningTeam {
                                id
                            }
                            tasks {
                                id
                                goal
                                dueAt
                                status
                                isPlanned
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
                                    status
                                    isPlanned
                                    owningTeam {
                                        id
                                    }
                                }
                            }
                            createdAt
                        }
                    }
                `,
                variables: {
                    sprintId,
                },
            })
            .then((payload: any) => payload?.sprints[0]);
    }

    public createSprint(
        teamId: string,
        sprint: CreateSprintInput,
    ): Promise<RemoteSprint> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
                    mutation createSprint(
                        $teamId: ID!
                        $sprint: CreateSprintInput!
                    ) {
                        createSprint(teamId: $teamId, sprint: $sprint) {
                            id
                            startAt
                            endAt
                            owningTeam {
                                id
                            }
                            createdAt
                        }
                    }
                `,
                variables: {
                    teamId,
                    sprint,
                },
            })
            .then((payload: any) => payload?.createSprint);
    }

    public deleteSprint(sprintId: string): Promise<RemoteSprint> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
                    mutation deleteSprint($sprintId: ID!) {
                        deleteSprint(sprintId: $sprintId) {
                            id
                        }
                    }
                `,
                variables: {
                    sprintId,
                },
            })
            .then((payload: any) => payload?.deleteSprint);
    }

    public addTaskToSprint(
        sprintId: string,
        taskId: string,
    ): Promise<RemoteTask> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
                    mutation addTaskToSprint($sprintId: ID!, $taskId: ID!) {
                        addTaskToSprint(sprintId: $sprintId, taskId: $taskId) {
                            id
                            isPlanned
                        }
                    }
                `,
                variables: {
                    sprintId,
                    taskId,
                },
            })
            .then((payload: any) => payload?.addTaskToSprint);
    }

    public removeTaskFromSprint(
        sprintId: string,
        taskId: string,
    ): Promise<RemoteTask> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
                    mutation removeTaskFromSprint(
                        $sprintId: ID!
                        $taskId: ID!
                    ) {
                        removeTaskFromSprint(
                            sprintId: $sprintId
                            taskId: $taskId
                        ) {
                            id
                            isPlanned
                        }
                    }
                `,
                variables: {
                    sprintId,
                    taskId,
                },
            })
            .then((payload: any) => payload?.removeTaskFromSprint);
    }
}
