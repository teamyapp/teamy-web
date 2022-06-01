import { RemoteThread } from './remoteThread';
import { RemoteUser } from './remoteUser';

export interface RemoteMessage {
    id: string;
    body?: string;
    author?: RemoteUser;
    thread?: RemoteThread;
    createdAt?: string;
    updatedAt?: string;
}
