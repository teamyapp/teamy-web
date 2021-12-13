import { gql } from '@apollo/client';
import Task from '../entity/Task';
import { GraphQLClient } from '../network/GraphQL.client';
import { QueryGetTask } from './queries';
import * as queries from './queries';

export class TaskService {
  private readonly graphQLClient: GraphQLClient;

  constructor(graphQLClient: GraphQLClient) {
    this.graphQLClient = graphQLClient;
  }

  public fetchTask(taskId: number): Promise<Task> {
    return this.graphQLClient
      .query<Task>({
        query: QueryGetTask,
        variables: { id: `${taskId}` },
      })
      .then((payload: any) => {
        return payload?.task;
      });
  }

  public updateTask(task: Task): Promise<Task> {
    return this.graphQLClient.mutate({
      mutation: gql`
                  mutation updateTask($taskId: ID!, $taskInput: TaskInput!) {
                    updateTask(taskId: $taskId, task: $taskInput) {
                      id
                      goal
                      context
                      dueAt
                      owner {
                        id
                      }
                    }
                  }
                  `,
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
      mutation: gql`
        mutation deleteTask($id: ID!) {
          deleteTask(taskId: $id) {
            id
          }
        }
        `,
      variables: { id: `${taskId}` },
    });
  }

  public startTask(taskId: number): Promise<any> {
    return this.graphQLClient.mutate({
      mutation: gql`
mutation startTask($taskId: ID!, $task: TaskInput!) {
  updateTask(taskId: $taskId, task: $task) {
    status
    id
  }
  promoteTaskToNeedAttention(taskId: $taskId) {
    id
  }
}
`,
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
      mutation: gql`
mutation completeTask($taskId: ID!, $task: TaskInput!) {
  updateTask(taskId: $taskId, task: $task) {
    id
    status
  }
}
`,
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
      mutation: gql`
mutation createTask($taskInput: TaskInput!) {
  createTask (task: $taskInput) {
    id
    goal
    context
    owner {
      id
    }
  }
}
`,
      variables: {
        taskInput: Object.assign({}, task, {
          ownerUserId: task.owner ? `${task.owner?.id}` : undefined,
        }),
      },
      refetchQueries: ["personalStatus", "teamStatus"]
    });
  }
}


