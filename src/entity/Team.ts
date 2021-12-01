import { User } from './User';

export default interface Team {
    iconUrl: string;
    name: string;
    members?: User[];
}
