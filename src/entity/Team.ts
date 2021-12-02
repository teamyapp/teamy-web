import { User } from './User';

export default interface Team {
    id: string;
    name: string;
    logoUrl: string;
    members?: User[];
}
