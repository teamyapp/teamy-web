import { User } from './user';

export default interface Team {
    id: number;
    name: string;
    iconUrl: string;
    members?: User[];
}
