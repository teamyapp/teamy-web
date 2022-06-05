import { Team } from '@core/entity/team';
import { Thread } from '@core/entity/thread';

import { TaskAction } from './taskAction';
import { TaskStatus } from './taskStatus';
import { User } from './user';

export interface Task {
    id: number;
    goal: string;
    dueAt?: Date; // RFC3339 string, todo: create a RFC3339 type
    context?: string;
    owner?: User;
    comments: Thread;
    owningTeam?: Team;
    effort?: number;
    availableActions: TaskAction[];
    status: TaskStatus;
}
