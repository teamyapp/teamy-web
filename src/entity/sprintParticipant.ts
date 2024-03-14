import { Duration } from '@lib/time/duration';

import { Sprint } from '@core/entity/sprint';
import { User } from '@core/entity/user';

export interface SprintParticipant {
    sprint: Sprint;
    user: User;
    totalBandwidth: Duration;
    unusedBandwidth: Duration;
    createdAt: Date;
    updatedAt?: Date;
}
