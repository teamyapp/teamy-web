import { TaskAction } from './taskAction';
import { TaskStatus } from './taskStatus';
import { Team } from './team';
import { Thread } from './thread';
import { User } from './user';

export interface Task {
    id: number;
    goal: string;
    context?: string;
    creator: User;
    owner?: User;
    owningTeam: Team;
    status: TaskStatus;
    comments: Thread;
    createdAt: Date;
    updatedAt?: Date;
    dueAt: Date;
    availableActions: TaskAction[]
}
