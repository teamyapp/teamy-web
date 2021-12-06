import Task from '../entity/Task';
import { GraphQLClient } from '../network/GraphQL.client';

interface TaskQueryPayload {
    task: Task;
}

export class TaskService {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public fetchTask(taskId: number): Promise<Task> {
        return this.graphQLClient
            .query<TaskQueryPayload>(
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
    effort
    numOfUnknowns
    availableActions
    createdAt
    updatedAt
  }
}
`,
                { id: taskId },
            )
            .then((payload: TaskQueryPayload) => {
                return payload?.task;
            });
    }

    public updateTask(task: Task): Promise<boolean> {
        return this.graphQLClient.query<boolean>(
            `
mutation updateTask($taskId: ID!, $taskInput: TaskInput!) {
  updateTask(taskId: $taskId, task: $taskInput) {
    id
  }
}
`,
            {
                taskId: task.id,
                taskInput: {
                    context: task.context,
                    dueAt: task.dueAt,
                    goal: task.goal,
                    ownerUserId: task.owner?.id,
                },
            },
        );
    }

    public deleteTask(taskId: number): Promise<boolean> {
        return this.graphQLClient.query<boolean>(
            `
mutation deleteTask($id: ID!) {
  deleteTask(taskId: $id)
}
`,
            { id: taskId },
        );
    }

    public startTask(taskId: number): Promise<boolean> {
        return this.graphQLClient.query<boolean>(
            `
mutation startTask($id: ID!) {
  startTask(taskId: $id)
}
`,
            { id: taskId },
        );
    }

    public completeTask(taskId: number): Promise<boolean> {
        return this.graphQLClient.query<boolean>(
            `
mutation completeTask($id: ID!) {
  completeTask(taskId: $id)
}
`,
            { id: taskId },
        );
    }

    public createTask(task: Task): Promise<boolean> {
        return this.graphQLClient.query<boolean>(
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
