import { RemoteApp } from './remoteApp';
import { RemoteUser } from './remoteUser';

export interface RemoteAppSecret {
    id: string;
    name: string;
    addedAt: string;
    addedBy: RemoteUser;
    lastUsedAt?: string;
    token?: string;
    app: RemoteApp;
}
