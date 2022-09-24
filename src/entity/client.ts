import { UserNode } from '@core/storage/graph/user.node';

export interface Client {
    clientId: number;
    user: UserNode
}
