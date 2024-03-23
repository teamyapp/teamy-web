import { RemoteStory } from './remoteStory';
import { RemoteUser } from './remoteUser';

export type RemotePhaseStatus = 'TODO' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';

export interface RemotePhase {
    id: string;
    name: string;
    status: RemotePhaseStatus;
    expectedStartAt: Date;
    actualStartAt?: Date;
    expectedEndAt: Date;
    actualEndAt?: Date;
    creator: RemoteUser;
    createdAt: Date;
    updatedAt?: Date;
    stories: RemoteStory[];
}
