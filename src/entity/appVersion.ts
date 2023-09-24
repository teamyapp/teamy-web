import { Money } from '@core/entity/money';
import { User } from '@core/entity/user';

export interface AppVersion {
    number: number;
    appName: string;
    description: string;
    changes: string[];
    createdAt: Date;
    createdBy: User;
    iconUrl: string;
    prices: Money[];
    isReady: boolean;
}
