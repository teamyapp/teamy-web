import { RemoteApp } from './remoteApp';
import { RemoteMoney } from './remoteMoney';
import { RemoteUser } from './remoteUser';

export interface RemoteAppVersion {
    number: number;
    appName: string;
    description: string;
    changes: string[];
    createdAt: string;
    createdBy: RemoteUser;
    prices: RemoteMoney[];
    isReady: boolean;
    locked: boolean;
    iconUrl: string;
    app: RemoteApp;
}
