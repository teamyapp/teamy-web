import { User } from './user';

export interface Team {
    id: string;
    name: string;
    iconUrl: string;
    members?: User[];
}
