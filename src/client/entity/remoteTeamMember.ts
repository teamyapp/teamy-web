import { RemoteTeam } from './remoteTeam';
import { RemoteUser } from './remoteUser';

export interface RemoteTeamMember {
    team: RemoteTeam;
    user: RemoteUser;
    weeklyBandwidth: string;
    createdAt: string;
    updatedAt?: string;
}
