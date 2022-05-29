import { RemoteThread } from './remoteThread';
import { RemoteUser } from './remoteUser';

export interface RemoteMessage {
    id: number;
    body?: string;
    author?: RemoteUser;
    thread?: RemoteThread;
    createdAt?: Date;
    updatedAt?: Date;
}
