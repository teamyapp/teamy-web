import { RemoteTeam } from './remoteTeam';

export interface RemoteUser {
    id: number;
    firstName?: string;
    lastName?: string;
    profileUrl?: string;
    createdAt?: Date;
    teams?: RemoteTeam[];
}
