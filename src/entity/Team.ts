import { User } from './User';

export default interface Team {
    id: number;
    name: string;
    logoUrl: string;
    members?: User[];
}
