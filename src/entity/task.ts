import { Duration } from '@lib/time/duration';

import { Priority } from '@core/entity/priority';
import { Team } from '@core/entity/team';
import { Thread } from '@core/entity/thread';

import { Client } from './client';
import { TaskAction } from './taskAction';
import { TaskLink } from './taskLink';
import { TaskStatus } from './taskStatus';
import { User } from './user';

export interface Task {
    id: number;
    goal: string;
    dueAt?: Date; // RFC3339 string, todo: create a RFC3339 type
    deliveredAt?: Date;
    context?: string;
    owner?: User;
    owningTeam: Team;
    effort?: Duration;
    priority?: Priority;
    comments: Thread;
    availableActions: TaskAction[];
    status: TaskStatus;
    isScheduled: boolean;
    isPlanned: boolean;
    awaitForTasks: Task[];
    draggingBy?: Client;
    links: TaskLink[];
}
