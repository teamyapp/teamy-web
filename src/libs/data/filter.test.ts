import { Task } from '@core/entity/task';
import {
    And,
    Between,
    GroupBy,
    GroupByOwners,
    InProgress,
    Or,
    Upcoming,
} from './filter';

function Example(tasks: Task[]) {
    let t1 = new Date();
    let t2 = new Date();

    // Give me upcomings tasks that due between t1 & t2 or in-progress  tasks
    tasks = tasks.filter(Or(And(Upcoming, Between(t1, t2)), InProgress));
    GroupByOwners(tasks);
    GroupBy(tasks, (task) => task.owner);

    // Achieve similar results as N filters on tasks
    GroupBy(tasks, (task) => task.status);
}
