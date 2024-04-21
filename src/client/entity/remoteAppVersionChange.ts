import { RemoteAppVersion } from './remoteAppVersion';

export interface RemoteAppVersionChange {
    id: string;
    appVersion: RemoteAppVersion;
    change: string;
}
