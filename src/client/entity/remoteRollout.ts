import { RemoteGroupRolloutRelation } from './remoteGroupRolloutRelation';
import { RemoteRolloutActivator } from './remoteRolloutActivator';
import { RemoteRolloutVersionSelector } from './remoteRolloutVersionSelector';

export interface RemoteRollout {
    id: string;
    name: string;
    isEnabled: boolean;
    activator: RemoteRolloutActivator;
    versionSelector: RemoteRolloutVersionSelector;
    groupRolloutRelations: RemoteGroupRolloutRelation[];
    createdAt: string;
    updatedAt?: string;
}

export type RemoteAppRolloutType = 'USER' | 'TEAM';
