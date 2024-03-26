import { RemoteStory } from './remoteStory';
import { RemoteUser } from './remoteUser';

export type RemotePhaseStatus = 'TODO' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';

export interface RemotePhase {
    id: string;
    name: string;
    status: RemotePhaseStatus;
    expectedStartAt: string;
    actualStartAt?: string;
    expectedEndAt: string;
    actualEndAt?: string;
    creator: RemoteUser;
    createdAt: string;
    updatedAt?: string;
    stories: RemoteStory[];
}
