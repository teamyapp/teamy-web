import { User } from './user';

export interface Team {
    id: number;
    name: string;
    iconUrl?: string;
    creator: User;
    owner: User;
    members?: User[];
}
