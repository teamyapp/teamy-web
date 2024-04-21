import { RemotePriority } from './remotePriority';
import { RemoteTask } from './remoteTask';
import { RemoteUser } from './remoteUser';

export type RemoteStoryStatus = 'TODO' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';

export interface RemoteStory {
    id: string;
    name: string;
    owner?: RemoteUser;
    isPlanned: boolean;
    status: RemoteStoryStatus;
    priority?: RemotePriority;
    creator: RemoteUser;
    createdAt: string;
    updatedAt?: string;
    tasks: RemoteTask[];
}
