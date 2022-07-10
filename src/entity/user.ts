import {Team} from './team';
import {LinkedUser} from '@core/entity/linkedUser';

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    profileUrl?: string;
    teams: Team[];
    linkedUsers: LinkedUser[];
}
