import { RemoteTeam } from './remoteTeam';
import { RemoteUser } from './remoteUser';

export interface RemoteTeamMemberGroup {
    id: string;
    name: string;
    team: RemoteTeam;
    members: RemoteUser[];
    createdAt: string;
    updatedAt?: string;
}
