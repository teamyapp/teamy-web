import { RemoteTaskLink } from './remoteTaskLink';
import { RemoteTaskStatus } from './remoteTaskStatus';
import { RemoteTeam } from './remoteTeam';
import { RemoteThread } from './remoteThread';
import { RemoteUser } from './remoteUser';
import { RemotePriority } from "@core/client/entity/remotePriority";

export interface RemoteTask {
    id: string;
    goal?: string;
    context?: string;
    creator: RemoteUser;
    owner?: RemoteUser;
    owningTeam?: RemoteTeam;
    status?: RemoteTaskStatus;
    isPlanned?: boolean;
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
