import { RemotePhase } from './remotePhase';
import { RemoteStory } from './remoteStory';
import { RemoteTeam } from './remoteTeam';
import { RemoteUser } from './remoteUser';

export interface RemoteProject {
    id: string;
    name: string;
    expectedStartAt: string;
    actualStartAt?: string;
    expectedEndAt: string;
    actualEndAt?: string;
    creator: RemoteUser;
    createdAt: string;
    updatedAt?: string;
    phases: RemotePhase[];
    stories: RemoteStory[];
    team: RemoteTeam;
}
