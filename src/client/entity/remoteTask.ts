import { RemoteTaskAction } from './remoteTaskAction';
import { RemoteTaskStatus } from './remoteTaskStatus';
import { RemoteTeam } from './remoteTeam';
import { RemoteThread } from './remoteThread';
import { RemoteUser } from './remoteUser';

export interface RemoteTask {
    id: number;
    goal?: string;
    context?: string;
    creator: RemoteUser;
    owner?: RemoteUser;
    owningTeam?: RemoteTeam;
    status?: RemoteTaskStatus;
    comments?: RemoteThread;
    createdAt?: Date;
    updatedAt?: Date;
    dueAt?: Date;
    availableActions?: RemoteTaskAction[];
}
