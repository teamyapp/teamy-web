import { LinkedUser } from '@core/entity/linkedUser';

import { Team } from './team';

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    profileUrl?: string;
    teams: Team[];
    linkedUsers: LinkedUser[];
}
