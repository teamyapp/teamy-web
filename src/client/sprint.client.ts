import { GraphQLClient } from '@lib/network/GraphQL.client';

import { RemoteCreateSprintInput } from '@core/client/entity/input';
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
                query: `
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
                                effort
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
                                deliveredAt
                                links {
                                    id
                                    taskId
                                    title
                                    url
                                    iconUrl
                                    iconHoverUrl
                                }
                            }
                            createdAt
                            participants {
                                sprint {
                                    id
                                }
                                user {
                                    id
                                    firstName
                                    lastName
                                }
                                totalBandwidth
                                unusedBandwidth
                            }
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
        sprint: RemoteCreateSprintInput,
    ): Promise<RemoteSprint> {
        return this.graphQLClient
            .mutate({
                mutation: `
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
                            participants {
                                sprint {
                                    id
                                }
                                user {
                                    id
                                    firstName
                                    lastName
                                }
                                totalBandwidth
                                unusedBandwidth
                            }
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
                mutation: `
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

    public moveTasksToSprint(
        fromSprintId: string,
        toSprintId: string,
        taskIds: string[],
    ): Promise<RemoteTask[]> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation moveTasksToSprint(
                        $fromSprintId: ID!
                        $toSprintId: ID!
                        $taskIds: [ID!]!
                    ) {
                        moveTasksToSprint(
                            fromSprintId: $fromSprintId
                            toSprintId: $toSprintId
                            taskIds: $taskIds
                        ) {
                            id
                        }
                    }
                `,
                variables: {
                    fromSprintId,
                    toSprintId,
                    taskIds,
                },
            })
            .then((payload: any) => payload?.moveTasksToSprint);
    }

    public copyTasksToSprint(
        toSprintId: string,
        taskIds: string[],
    ): Promise<RemoteTask[]> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation copyTasksToSprint(
                        $toSprintId: ID!
                        $taskIds: [ID!]!
                    ) {
                        copyTasksToSprint(
                            toSprintId: $toSprintId
                            taskIds: $taskIds
                        ) {
                            id
                        }
                    }
                `,
                variables: {
                    toSprintId,
                    taskIds,
                },
            })
            .then((payload: any) => payload?.copyTasksToSprint);
    }

    public addTaskToSprint(
        sprintId: string,
        taskId: string,
    ): Promise<RemoteTask> {
        return this.graphQLClient
            .mutate({
                mutation: `
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
                mutation: `
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
