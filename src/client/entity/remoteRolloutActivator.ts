import { RemoteRolloutActivatorType } from './remoteRolloutActivatorType';

export interface RemoteRolloutActivator {
    id: string;
    type: RemoteRolloutActivatorType;
    createdAt: string;
    updatedAt?: string;
    startAt?: string;
    endAt?: string;
    maxViewers?: number;
    percentage?: number;
}
