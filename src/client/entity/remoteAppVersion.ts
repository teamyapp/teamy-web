import { RemoteApp } from './remoteApp';
import { RemoteAppVersionChange } from './remoteAppVersionChange';
import { RemoteMoney } from './remoteMoney';
import { RemoteUser } from './remoteUser';

export type RemoteAppVersionStatus = 
    'INIT' | 
    'UPLOADING' | 
    'PROCESSING' | 
    'READY' | 
    'ERROR';

export interface RemoteAppVersion {
    number: number;
    appName: string;
    description: string;
    changes: RemoteAppVersionChange[];
    createdAt: string;
    createdBy: RemoteUser;
    prices: RemoteMoney[];
    status: RemoteAppVersionStatus;
    locked: boolean;
    errorMessage?: string;
    app: RemoteApp;
}
