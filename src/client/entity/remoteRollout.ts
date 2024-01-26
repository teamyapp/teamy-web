import { RemoteRolloutActivator } from './remoteRolloutActivator';
import { RemoteRolloutVersionSelector } from './remoteRolloutVersionSelector';

export interface RemoteRollout {
    id: string;
    name: string;
    isEnabled: boolean;
    activator: RemoteRolloutActivator;
    versionSelector: RemoteRolloutVersionSelector;
    createdAt: Date;
    updatedAt?: Date;
}
