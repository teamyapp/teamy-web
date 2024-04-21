import { App } from '@core/entity/app';
import { User } from '@core/entity/user';

export interface AppSecret {
    id: number;
    name: string;
    addedAt: Date;
    addedBy: User;
    lastUsedAt?: Date;
    token?: string;
    app: App;
}
