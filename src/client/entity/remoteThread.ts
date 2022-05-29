import { RemoteMessage } from './remoteMessage';

export interface RemoteThread {
    id: number;
    messages?: RemoteMessage[];
}
