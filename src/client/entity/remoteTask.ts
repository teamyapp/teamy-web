import { RemotePriority } from '@core/client/entity/remotePriority';

import { RemoteTaskLink } from './remoteTaskLink';
import { RemoteTaskStatus } from './remoteTaskStatus';
import { RemoteTeam } from './remoteTeam';
import { RemoteThread } from './remoteThread';
import { RemoteUser } from './remoteUser';

export interface RemoteTask {
    id: string;
    goal?: string;
    context?: string;
    creator: RemoteUser;
    owner?: RemoteUser;
    owningTeam?: RemoteTeam;
    status?: RemoteTaskStatus;
    isScheduled: boolean;
    comments?: RemoteThread;
    createdAt?: string;
    updatedAt?: string;
    deliveredAt?: string;
    dueAt?: string;
    effort?: string;
    priority?: RemotePriority;
    awaitForTasks: RemoteTask[];
    links: RemoteTaskLink[];
}
