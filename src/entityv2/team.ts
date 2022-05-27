import { Invitation } from './invitation';
import { Task } from './task';
import { User } from './user';

export interface Team {
    id: number;
    name: string;
    iconUrl?: string;
    createdAt: Date;
    creator: User
    members: User[]
    tasks: Task[]
    invitations: Invitation[]
}
