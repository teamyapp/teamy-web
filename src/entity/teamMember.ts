import { Duration } from '@lib/retry/duration';
import { Team } from '@core/entity/team';
import { User } from '@core/entity/user';

export interface TeamMember {
    team: Team;
    user: User;
    weeklyBandwidth: Duration;
    createdAt: Date;
    updatedAt?: Date;
}
