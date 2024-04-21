import { RemoteRolloutVersionSelectorType } from './remoteRolloutVersionSelectorType';

export interface RemoteRolloutVersionSelector {
    id: string;
    type: RemoteRolloutVersionSelectorType;
    versionNumber?: number;
    versionNumbers?: number[];
    createdAt: string;
    updatedAt?: string;
}
