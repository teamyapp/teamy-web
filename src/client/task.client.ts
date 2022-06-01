import { gql } from '@apollo/client';

import { GraphQLClient } from '@lib/network/GraphQL.client';

import { RemoteTask } from '@core/client/entity/remoteTask';
import { CreateTaskInput, UpdateTaskInput } from '@core/client/entity/input';

export class TaskClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    getTask(taskId: string): Promise<RemoteTask> {
        return this.graphQLClient
            .query({
                query: gql`
                    query getTask($taskId: ID!) {
                        tasks(filter: { taskId: $taskId }) {
                            id
                            goal
                            dueAt
                            context
                            owner {
                                id
                                firstName
                                lastName
                                profileUrl
                            }
                            createdAt
                            comments {
                                id
                                messages {
                                    id
                                    body
                                    author {
                                        id
                                        firstName
                                        lastName
                                        profileUrl
                                    }
                                    createdAt
                                    updatedAt
                                }
                            }
                        }
                    }
                `,
                variables: {
                    taskId
                },
            })
            .then((payload: any) => payload?.tasks[0]);
    }

    getTasksPreview(teamId: string): Promise<RemoteTask[]> {
        return this.graphQLClient
            .query({
                query: gql`
                    query getTasksPreview($teamId: ID!) {
                        teams(filter: { teamId: $teamId }) {
                            id
                            tasks {
                                id
                                goal
                                dueAt
                                status
                                owner {
                                    id
                                    firstName
                                    lastName
                                    profileUrl
                                }
                                owningTeam {
                                    id
                                }
                                availableActions
                            }
                        }
                    }
                `,
                variables: {
                    teamId
                },
            })
            .then((payload: any) => payload?.teams[0]?.tasks);
    }

    createTask(teamId: string, task: CreateTaskInput): Promise<RemoteTask> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
                    mutation createTask($teamId: ID!, $task: CreateTaskInput!) {
                        createTask(teamId: $teamId, task: $task) {
                            id
                            goal
                            creator {
                                id
                                lastName
                                firstName
                                profileUrl
                            }
                            owner {
                                id
                                firstName
                                lastName
                                profileUrl
                            }
                            owningTeam {
                                id
                            }
                            status
                            createdAt
                            availableActions
                        }
                    }
                `,
                variables: {
                    teamId,
                    task,
                },
            })
            .then((payload: any) => payload?.createTask);
    }

    updateTask(taskId: string, input: UpdateTaskInput): Promise<RemoteTask> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
                    mutation updateTask(
                        $taskId: ID!
                        $input: UpdateTaskInput!
                    ) {
                        updateTask(taskId: $taskId, input: $input) {
                            id
                            goal
                            context
                            owner {
                                id
                            }
                            owningTeam {
                                id
                            }
                            effort
                            dueAt
                        }
                    }
                `,
                variables: {
                    taskId,
                    input,
                },
            })
            .then((payload: any) => payload?.updateTask);
    }

    deleteTask(taskId: string): Promise<RemoteTask> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
                    mutation deleteTask($taskId: ID!) {
                        deleteTask(taskId: $taskId) {
                            id
                        }
                    }
                `,
                variables: {
                    taskId
                },
            })
            .then((payload: any) => payload?.deleteTask);
    }

    moveTaskToUpcoming(taskId: string): Promise<RemoteTask> {
        return this.graphQLClient
        .mutate({
            mutation: gql`
                mutation moveTaskToUpcoming($taskId: ID!) {
                    moveTaskToUpcoming(taskId: $taskId) {
                        id
                        status
                        updatedAt
                    }
                }
            `,
            variables: {
                taskId
            },
        })
        .then((payload: any) => payload?.moveTaskToUpcoming);
    }

    moveTaskToInProgress(taskId: string): Promise<RemoteTask> {
        return this.graphQLClient
        .mutate({
            mutation: gql`
                mutation moveTaskToInProgress($taskId: ID!) {
                    moveTaskToInProgress(taskId: $taskId) {
                        id
                        status
                        owner {
                            id
                        }
                        updatedAt
                        availableActions
                    }
                }
            `,
            variables: {
                taskId
            },
        })
        .then((payload: any) => payload?.moveTaskToInProgress);
    }

    moveTaskToDelivered(taskId: string): Promise<RemoteTask> {
        return this.graphQLClient
        .mutate({
            mutation: gql`
                mutation moveTaskToDelivered($taskId: ID!) {
                    moveTaskToDelivered(taskId: $taskId) {
                        id
                        status
                        updatedAt
                        availableActions
                    }
                }
            `,
            variables: {
                taskId
            },
        })
        .then((payload: any) => payload?.moveTaskToDelivered);
    }

    moveTaskToBlocked(taskId: string, reason: string): Promise<RemoteTask> {
        return Promise.resolve<any>({ });
    }

    moveTaskToAwaiting(taskId: string, awaitOnTaskIds: [string]): Promise<RemoteTask> {
        return Promise.resolve<any>({ });
    }
}
