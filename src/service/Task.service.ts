import Task from '../entity/Task';
import { GraphQLClient } from '../network/GraphQL.client';

export class TaskService {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public fetchTask(taskId: number): Promise<Task> {
        return this.graphQLClient
            .query<Task>(
                `
query getTask($id: ID!) {
  task(id: $id) {
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
    // effort
    // numOfUnknowns
    availableActions
    createdAt
  }
}
`,
                { id: `${taskId}` },
            )
            .then((payload: any) => {
                return payload?.task;
            });
    }

    public updateTask(task: Task): Promise<Task> {
        return this.graphQLClient.query<Task>(
            `
mutation updateTask($taskId: ID!, $taskInput: TaskInput!) {
  updateTask(taskId: $taskId, task: $taskInput) {
    id
  }
}
`,
            {
                taskId: `${task.id}`,
                taskInput: {
                    context: task.context,
                    dueAt: task.dueAt,
                    goal: task.goal,
                    ownerUserId: task.owner?.id,
                },
            },
        );
    }

    public deleteTask(taskId: number): Promise<Task> {
        return this.graphQLClient.query<Task>(
            `
mutation deleteTask($id: ID!) {
  deleteTask(taskId: $id) {
    id
  }
}
`,
            { id: `${taskId}` },
        );
    }

    public startTask(taskId: number): Promise<any> {
        return this.graphQLClient.query<any>(
            `
mutation startTask($taskId: ID!, $task: TaskInput!) {
  updateTask(taskId: $taskId, task: $task) {
    id
  }
  promoteTaskToNeedAttention(taskId: $taskId) {
    id
  }
}
`,
            {
                taskId: `${taskId}`,
                task: {
                    status: 'IN_PROGRESS',
                },
            },
        );
    }

    public completeTask(taskId: number): Promise<any> {
        return this.graphQLClient.query<any>(
            `
mutation completeTask($taskId: ID!, $task: TaskInput!) {
  updateTask(taskId: $taskId, task: $task) {
    id
  }
}
`,
            {
                taskId: `${taskId}`,
                task: {
                    status: 'DELIVERED',
                },
            },
        );
    }

    public createTask(task: Task): Promise<Task> {
        return this.graphQLClient.query<Task>(
            `
mutation createTask($taskInput: TaskInput!) {
  createTask (task: $taskInput) {
    id
  }
}
`,
            {
                taskInput: Object.assign({}, task, {
                    ownerUserId: task.owner ? `${task.owner?.id}` : undefined,
                }),
            },
        );
    }
}
