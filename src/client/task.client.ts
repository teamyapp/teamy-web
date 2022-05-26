import { gql } from '@apollo/client';
import { Task } from '@core/entityv2/task';
import { TaskStatus } from '@core/entityv2/taskStatus';
import { GraphQLClient } from '@lib/network/GraphQL.client';

export interface CreateTaskInput {
    goal: string;
    context?: string;
    ownerUserId: number;
    dueAt: Date;
}

export interface UpdateTaskInput {
    goal: string;
    context?: string;
    ownerUserId?: number;
    owningTeamId: number;
    status: TaskStatus;
    effort?: number;
    dueAt?: Date;
}

export class TaskClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    getTask(taskId: number): Promise<Task> {
        return this.graphQLClient.query({
            query: gql`
                query getTask($taskId: ID!) {
                    tasks(filter : {
                        taskId: $taskId
                    }) {
                        id
                        goal
                        dueAt
                        context
                        owner {
                            firstName
                            lastName
                            profileUrl
                        }
                        createdAt
                        comments {
                            messages {
                                body
                                author {
                                    firstName
                                    lastName
                                    profileUrl
                                }
                                createdAt
                                updatedAt
                            }
                        }
                    }
                }`,
            variables: {
                taskId,
            },
        })
        .then((payload: any) => payload?.tasks[0]);
    }

    createTask(teamId: number, task: CreateTaskInput): Promise<Task> {
        return this.graphQLClient.mutate({
            mutation: gql`
                mutation createTask($teamId: ID!, $task: CreateTaskInput!) {
                    createTask(teamId: $teamId, task: $task) {
                        id
                    }
                }
            `,
            variables: {
                teamId,
                task,
            },
        })
        .then((payload: any) => payload.createTask);
    }

    updateTask(taskId: number, input: UpdateTaskInput): Promise<Task> {
        return this.graphQLClient.mutate({
            mutation: gql`
                mutation updateTask($taskId: ID!, $input: UpdateTaskInput!) {
                    updateTask(taskId: $taskId, input: $input) {
                        id
                    }
                }
            `,
            variables: {
                taskId,
                input,
            },
        })
        .then((payload: any) => payload.updateTask);
    }

    deleteTask(taskId: number): Promise<Task> {
        return this.graphQLClient.mutate({
            mutation: gql`
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
        .then((payload: any) => payload.updateTask);
    }

    startTask(taskId: number): Promise<Task> {
        // TODO: implement me
        return Promise.resolve<any>({});
    }

    completeTask(taskId: number): Promise<Task> {
        // TODO: implement me
        return Promise.resolve<any>({});
    }
}
