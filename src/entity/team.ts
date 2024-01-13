import { Sprint } from '@core/entity/sprint';
import { TeamMember } from '@core/entity/teamMember';

import { User } from './user';
import { App } from './app';
import { AppInstallation } from './appInstallation';

export interface Team {
    id: number;
    name: string;
    iconUrl?: string;
    creator: User;
    owner: User;
    members?: TeamMember[];
    sprints?: Sprint[];
    activeSprint?: Sprint;
    managedApps: App[];
    appInstallations: AppInstallation[];
}
