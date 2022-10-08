import { GraphQLClient } from '@lib/network/GraphQL.client';

import {
    RemoteCreateTaskInput,
    RemoteUpdateTaskInput,
} from '@core/client/entity/input';
import { RemoteTask } from '@core/client/entity/remoteTask';

export class TaskClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    getTask(taskId: string): Promise<RemoteTask> {
        return this.graphQLClient
            .query({
                operationName: "getTask",
                query: `
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
                            effort
                            owningTeam {
                                id
                            }
                            isPlanned
                            createdAt
                            deliveredAt
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
                                    thread {
                                        id
                                    }
                                    createdAt
                                    updatedAt
                                }
                            }
                            status
                        }
                    }
                `,
                variables: {
                    taskId,
                },
            })
            .then((payload: any) => payload?.tasks[0]);
    }

    createTask(
        teamId: string,
        task: RemoteCreateTaskInput,
    ): Promise<RemoteTask> {
        return this.graphQLClient
            .mutate({
                operationName: "createTask",
                query: `
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
                            status
                            createdAt
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

    updateTask(
        taskId: string,
        input: RemoteUpdateTaskInput,
    ): Promise<RemoteTask> {
        return this.graphQLClient
            .mutate({
                operationName: "updateTask",
                query: `
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
                            effort
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
                operationName: "deleteTask",
                query: `
                    mutation deleteTask($taskId: ID!) {
                        deleteTask(taskId: $taskId) {
                            id
                        }
                    }
                `,
                variables: {
                    taskId,
                },
            })
            .then((payload: any) => payload?.deleteTask);
    }

    moveTaskToUpcoming(taskId: string): Promise<RemoteTask> {
        return this.graphQLClient
            .mutate({
                operationName: "moveTaskToUpcoming",
                query: `
                    mutation moveTaskToUpcoming($taskId: ID!) {
                        moveTaskToUpcoming(taskId: $taskId) {
                            id
                            status
                            updatedAt
                        }
                    }
                `,
                variables: {
                    taskId,
                },
            })
            .then((payload: any) => payload?.moveTaskToUpcoming);
    }

    moveTaskToInProgress(taskId: string): Promise<RemoteTask> {
        return this.graphQLClient
            .mutate({
                operationName: "moveTaskToInProgress",
                query: `
                    mutation moveTaskToInProgress($taskId: ID!) {
                        moveTaskToInProgress(taskId: $taskId) {
                            id
                            status
                            owner {
                                id
                            }
                            updatedAt
                        }
                    }
                `,
                variables: {
                    taskId,
                },
            })
            .then((payload: any) => payload?.moveTaskToInProgress);
    }

    startDraggingTask(taskId: string, clientId: string): Promise<string> {
        return this.graphQLClient
            .mutate({
                operationName:"startDraggingTask",
                query: `
                    mutation startDraggingTask($taskId: ID!, $clientId: ID!) {
                        startDraggingTask(taskId: $taskId, clientId: $clientId)
                    }
                `,
                variables: {
                    taskId,
                    clientId,
                },
            })
            .then((payload: any) => payload?.startDraggingTask);
    }

    stopDraggingTask(taskId: string, clientId: string): Promise<string> {
        return this.graphQLClient
            .mutate({
                operationName: "stopDraggingTask",
                query: `
                    mutation stopDraggingTask($taskId: ID!, $clientId: ID!) {
                        stopDraggingTask(taskId: $taskId, clientId: $clientId)
                    }
                `,
                variables: {
                    taskId,
                    clientId,
                },
            })
            .then((payload: any) => payload?.stopDraggingTask);
    }

    moveTaskToDelivered(taskId: string): Promise<RemoteTask> {
        return this.graphQLClient
            .mutate({
                operationName: "moveTaskToDelivered",
                query: `
                    mutation moveTaskToDelivered($taskId: ID!) {
                        moveTaskToDelivered(taskId: $taskId) {
                            id
                            status
                            updatedAt
                            deliveredAt
                        }
                    }
                `,
                variables: {
                    taskId,
                },
            })
            .then((payload: any) => payload?.moveTaskToDelivered);
    }

    moveTaskToBlocked(taskId: string, reason: string): Promise<RemoteTask> {
        return Promise.resolve<any>({});
    }

    moveTaskToAwaiting(
        taskId: string,
        awaitOnTaskIds: [string],
    ): Promise<RemoteTask> {
        return Promise.resolve<any>({});
    }
}
