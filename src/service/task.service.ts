import { FetchPolicy } from '@apollo/client';

import { GraphQLClient } from '@lib/network/GraphQL.client';

import { TaskCreationInput } from '@core/entity/events';
import { Task } from '@core/entity/task';

import * as mutations from './mutations';
import * as queries from './queries';

export const goalLengthLimit = 100;

export class TaskService {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public fetchTask(
        taskId: number | string,
        policy: FetchPolicy,
    ): Promise<Task> {
        return this.graphQLClient
            .query({
                query: queries.task,
                variables: { id: taskId },
                fetchPolicy: policy,
            })
            .then((payload: any) => {
                return payload?.task;
            });
    }

    public updateTask(task: Task): Promise<Task> {
        return this.graphQLClient.mutate({
            mutation: mutations.updateTask,
            variables: {
                taskId: task.id,
                taskInput: {
                    context: task.context,
                    dueAt: task.dueAt,
                    goal: task.goal,
                    ownerUserId: task.owner?.id,
                },
            },
        });
    }

    public deleteTask(taskId: number | string): Promise<Task> {
        return this.graphQLClient.mutate({
            mutation: mutations.deleteTask,
            variables: { taskId: taskId },
        });
    }

    public startTask(taskId: number | string): Promise<any> {
        return this.graphQLClient.mutate({
            mutation: mutations.startTask,
            variables: {
                taskId: taskId,
                task: {
                    status: 'IN_PROGRESS',
                },
            },
        });
    }

    public completeTask(taskId: number | string): Promise<any> {
        return this.graphQLClient.mutate({
            mutation: mutations.completeTask,
            variables: {
                taskId: taskId,
                task: {
                    status: 'DELIVERED',
                },
            },
        });
    }

    public createTask(task: TaskCreationInput, teamId: string): Promise<Task> {
        return this.graphQLClient.mutate({
            mutation: mutations.createTask,
            variables: {
                taskInput: task,
                teamId: teamId,
            },
        });
    }

    public removeTaskOwner(taskId: string) {
        return this.graphQLClient.mutate({
            mutation: mutations.removeTaskOwner,
            variables: { taskId: taskId },
        });
    }
}
