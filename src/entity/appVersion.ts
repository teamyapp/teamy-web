import { Money } from '@core/entity/money';
import { User } from '@core/entity/user';

import { App } from './app';

export type AppVersionStatus = 'INIT' | 'UPLOADING' | 'PROCESSING' | 'READY' | 'ERROR';

export interface AppVersion {
    number: number;
    appName: string;
    description: string;
    changes: string[];
    createdAt: Date;
    createdBy: User;
    prices: Money[];
    status: AppVersionStatus;
    locked: boolean;
    app: App;
    iconPath: string;
    packagePath: string;
    errorMessage?: string;
}
