import { RemoteApp } from './remoteApp';
import { RemoteGroupType } from './remoteGroupType';
import { RemoteRollout } from './remoteRollout';
import { RemoteTeam } from './remoteTeam';

export interface RemoteTeamGroup {
    id: string;
    type: RemoteGroupType;
    name: string;
    filter?: string;
    teams?: RemoteTeam[];
    memberCount?: number;
    createdAt: string;
    updatedAt?: string;
    rollouts: RemoteRollout[];
    app: RemoteApp;
}
