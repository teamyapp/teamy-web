import { RemoteTeam } from './remoteTeam';
import { RemoteUser } from './remoteUser';

export interface RemoteTeamMemberGroup {
    id: string;
    name: string;
    orderIndex: number;
    team: RemoteTeam;
    members: RemoteUser[];
    createdAt: string;
    updatedAt?: string;
}
