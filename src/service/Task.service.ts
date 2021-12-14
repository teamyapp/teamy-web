import Task from '../entity/Task';
import { GraphQLClient } from '../network/GraphQL.client';
import { QueryGetTask } from './queries';
import * as mutations from './mutations';


export class TaskService {
  private readonly graphQLClient: GraphQLClient;

  constructor(graphQLClient: GraphQLClient) {
    this.graphQLClient = graphQLClient;
  }

  public fetchTask(taskId: number): Promise<Task> {
    return this.graphQLClient
      .query({
        query: QueryGetTask,
        variables: { id: `${taskId}` },
      })
      .then((payload: any) => {
        return payload?.task;
      });
  }

  public updateTask(task: Task): Promise<Task> {
    return this.graphQLClient.mutate({
      mutation: mutations.updateTask,
      variables: {
        taskId: `${task.id}`,
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
      variables: { id: `${taskId}` },
    });
  }

  public startTask(taskId: number): Promise<any> {
    return this.graphQLClient.mutate({
      mutation: mutations.startTask,
      variables: {
        taskId: `${taskId}`,
        task: {
          status: 'IN_PROGRESS',
        },
      }
    });
  }

  public completeTask(taskId: number): Promise<any> {
    return this.graphQLClient.mutate({
      mutation: mutations.completeTask,
      variables: {
        taskId: `${taskId}`,
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
          ownerUserId: task.owner ? `${task.owner?.id}` : undefined,
        }),
      }
    });
  }
}
