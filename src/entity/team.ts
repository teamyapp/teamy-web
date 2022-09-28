import { Sprint } from '@core/entity/sprint';
import { TeamMember } from '@core/entity/teamMember';

import { User } from './user';

export interface Team {
    id: number;
    name: string;
    iconUrl?: string;
    creator: User;
    owner: User;
    members?: TeamMember[];
    sprints?: Sprint[];
}
