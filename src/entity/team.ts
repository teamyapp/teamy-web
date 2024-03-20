import { Sprint } from '@core/entity/sprint';
import { TeamMember } from '@core/entity/teamMember';

import { App } from './app';
import { TeamAppInstallation } from './teamAppInstallation';
import { User } from './user';
import { Project } from './project';

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
    appInstallations: TeamAppInstallation[];
    projects: Project[];
}
