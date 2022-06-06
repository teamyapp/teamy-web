import { RemoteTeam } from './remoteTeam';

export interface RemoteUser {
    id: string;
    firstName?: string;
    lastName?: string;
    profileUrl?: string;
    createdAt?: string;
    teams?: RemoteTeam[];
}
