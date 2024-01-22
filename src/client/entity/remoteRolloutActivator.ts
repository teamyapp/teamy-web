import { RemoteRolloutActivatorType } from './remoteRolloutActivatorType';

export interface RemoteRolloutActivator {
    id: string;
    type: RemoteRolloutActivatorType;
    createdAt: Date;
    updatedAt?: Date;
    startedAt?: Date;
    endedAt?: Date;
    maxViewers?: number;
    percentage?: number;
}
