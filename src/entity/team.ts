import { User } from './User';

export default interface Team {
    id: number;
    name: string;
    iconUrl: string;
    members?: User[];
}
