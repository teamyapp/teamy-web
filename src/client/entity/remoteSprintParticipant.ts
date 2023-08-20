import { RemoteSprint } from '@core/client/entity/remoteSprint';
import { RemoteUser } from '@core/client/entity/remoteUser';

export interface RemoteSprintParticipant {
    sprint: RemoteSprint;
    user: RemoteUser;
    totalBandwidth?: string;
    unusedBandwidth?: string;
    createdAt?: string;
    updatedAt?: string;
}
