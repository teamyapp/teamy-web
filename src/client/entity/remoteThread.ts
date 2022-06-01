import { RemoteMessage } from './remoteMessage';

export interface RemoteThread {
    id: string;
    messages?: RemoteMessage[];
}
