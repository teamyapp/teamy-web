import { GraphQLClient } from '@lib/network/GraphQL.client';

import {
    RemoteCreateTaskInput,
    RemoteCreateTaskLinkInput,
    RemoteUpdateTaskInput,
} from '@core/client/entity/input';
import { RemoteTask } from '@core/client/entity/remoteTask';
import { print } from 'graphql';
import addTaskToStory from './graphql/mutation/addTaskToStory.graphql';
import removeTaskFromStory from './graphql/mutation/removeTaskFromStory.graphql';
import addTasksToStory from './graphql/mutation/addTasksToStory.graphql';
import getTask from './graphql/query/getTask.graphql';
import createTask from './graphql/mutation/createTask.graphql';
import updateTask from './graphql/mutation/updateTask.graphql';
import removeTasksFromStory from './graphql/mutation/removeTasksFromStory.graphql';
import { RemoteStory } from './entity/remoteStory';
import { RemoteTaskLink } from './entity/remoteTaskLink';

export class TaskClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    getTask(taskId: string): Promise<RemoteTask> {
        return this.graphQLClient
            .query({
                query: print(getTask),
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
                mutation: print(createTask),
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
                mutation: print(updateTask),
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
                mutation: `
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
                mutation: `
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
                mutation: `
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
                mutation: `
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
                mutation: `
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
                mutation: `
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

    addTaskToStory(storyId: string, taskId: string): Promise<RemoteStory> {
        return this.graphQLClient.mutate({
            mutation: print(addTaskToStory),
            variables: {
                storyId,
                taskId,
            },
        }).then(({addTaskToStory}) => addTaskToStory);
    }

    removeTaskFromStory(storyId: string, taskId: string ): Promise<RemoteStory> {
        return this.graphQLClient.mutate({
            mutation: print(removeTaskFromStory),
            variables: {
                storyId,
                taskId,
            },
        }).then(({removeTaskFromStory}) => removeTaskFromStory);
    }

    addTasksToStory(storyId: string, taskIds: string[]): Promise<RemoteStory> {
        return this.graphQLClient.mutate({
            mutation: print(addTasksToStory),
            variables: {
                storyId,
                taskIds,
            },
        }).then(({addTasksToStory}) => addTasksToStory);
    }

    removeTasksFromStory(storyId: string, taskIds: string[]): Promise<RemoteStory> {
        return this.graphQLClient.mutate({
            mutation: print(removeTasksFromStory),
            variables: {
                storyId,
                taskIds,
            },
        }).then(({removeTasksFromStory}) => removeTasksFromStory);
    }

    createTaskLink(taskId: string, input: RemoteCreateTaskLinkInput): Promise<RemoteTaskLink> {
        return this.graphQLClient.mutate({
            mutation: `
                mutation createTaskLink($taskId: ID!, $input: CreateTaskLinkInput!) {
                    createTaskLink(taskId: $taskId, input: $input) {
                        id
                        taskId
                        title
                        previewTitle
                        url
                        iconUrl
                        iconHoverUrl
                    }
                }
            `,
            variables: {
                taskId,
                input,
            },
        }).then(({createTaskLink}) => createTaskLink);
    }

    deleteTaskLink(id: string): Promise<RemoteTaskLink> {
        return this.graphQLClient.mutate({
            mutation: `
                mutation deleteTaskLink($id: ID!) {
                    deleteTaskLink(id: $id) {
                        id
                    }
                }
            `,
            variables: {
                id,
            },
        }).then(({deleteTaskLink}) => deleteTaskLink);
    }
}
