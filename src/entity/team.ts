import { User } from './user';

export interface Team {
    id: number;
    name: string;
    iconUrl?: string;
    members?: User[];
}
