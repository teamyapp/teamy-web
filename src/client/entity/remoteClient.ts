import { RemoteUser } from './remoteUser';

export interface RemoteClient {
    id: string;
    user: RemoteUser;
}
