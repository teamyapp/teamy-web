import { User } from '../entity/User';

export interface QueryPayload {
    me: User;
}

export interface MutationPayload {
    updateActiveTeam: boolean;
}
