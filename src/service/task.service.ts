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



// don't know where to put this code because we are not really doing a traditional layerred architecture
//
// Abstract:
// Project Progression Management, at the computation level, is a series of tranductions on a sequence of tasks.
//
// key words:
// Transducer https://clojure.org/reference/transducers
// Transduction is a generalization of reduction & other functional paradigm.
// In short, a transducer transforms(A->B) & reduces(many->one) data.

// This is not a generic implementation of Transducer, 
// but a business aware implementation.

// Because JS does not have a good generalization of functor APIs for Iterabls,
// Use Array here.
// Meaning this is a synchronize implementation only.
// When async or infinite API is needed, implementation will change.
type Filterer<T> = (data: T) => boolean

// Or reduces a sequence of fitlerers to one filterers with Or/Union semantics.
function Or<T>(...filterers: Filterer<T>[]): Filterer<T> {
    return (data: T) => {
        for (let f of filterers) {
            if (f(data)) {
                return true
            }
        }
        return false
    }
}

// And reduces a sequence of fitlerers to one filterers with And/Intersection semantics.
function And<T>(...filterers: Filterer<T>[]): Filterer<T> {
    return (data: T) => {
        for (let f of filterers) {
            if (!f(data)) {
                return false
            }
        }
        return true
    }
}

const Upcoming: Filterer<Task> = (task: Task) => task.status === 'Upcoming';
const InProgress: Filterer<Task> = (task: Task) => task.status === 'InProgress';
const Delivered: Filterer<Task> = (task: Task) => task.status === 'Delivered';
function Between(begin: Date, end: Date): Filterer<Task> {
    return (task: Task) => {
        return task.dueAt !== undefined
            && begin.getUTCMilliseconds() < Date.parse(task.dueAt)
            && Date.parse(task.dueAt) < end.getUTCMilliseconds();
    }
}
function Contains(text: string): Filterer<Task> {
    return (task: Task) => task.goal.includes(text) || (task.context !== undefined && task.context.includes(text))
}

// Given a sequence of tasks, split it to N sequences of tasks where N is the number of unique assignees.
// this is useful when the UI wants to group tasks by owners instead of status.
function SplitByOwners(tasks: Task[]): Map<User | undefined, Task[]> {
    return tasks.reduce((accu, cur) => {
        if (accu.has(cur.owner)) {
            accu.get(cur.owner)?.push(cur)
        } else {
            accu.set(cur.owner, [cur])
        }
        return accu
    }, new Map<User | undefined, Task[]>())
}


function Example(tasks: Task[]) {
    let t1 = new Date();
    let t2 = new Date();

    // Give me upcomings tasks that due between t1 & t2 or in-progress  tasks
    tasks = tasks.filter(Or(
        And(Upcoming, Between(t1, t2)),
        InProgress,
    ))
    SplitByOwners(tasks)
}
