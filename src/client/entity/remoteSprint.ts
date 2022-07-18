import { RemoteTask } from '@core/client/entity/remoteTask';
import { RemoteTeam } from '@core/client/entity/remoteTeam';

export interface RemoteSprint {
    id: string;
    startAt: string;
    endAt: string;
    owningTeam: RemoteTeam;
    tasks: RemoteTask[];
    createdAt: string;
}
