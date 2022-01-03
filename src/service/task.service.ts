import { FetchPolicy } from '@apollo/client';

import { GraphQLClient } from '@lib/network/GraphQL.client';

import { Task } from '@core/entity/task';
import { User } from '@core/entity/user';

import * as mutations from './mutations';
import * as queries from './queries';
import moment from 'moment';

export class TaskService {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public fetchTask(taskId: number, policy: FetchPolicy): Promise<Task> {
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

    public deleteTask(taskId: number): Promise<Task> {
        return this.graphQLClient.mutate({
            mutation: mutations.deleteTask,
            variables: { taskId: taskId },
        });
    }

    public startTask(taskId: number): Promise<any> {
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

    public completeTask(taskId: number): Promise<any> {
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

    public createTask(task: Task): Promise<Task> {
        return this.graphQLClient.mutate({
            mutation: mutations.createTask,
            variables: {
                taskInput: Object.assign({}, task, {
                    ownerUserId: task.owner ? task.owner?.id : undefined,
                }),
            },
        });
    }
}
