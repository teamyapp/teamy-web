import { Sprint } from '@core/entity/sprint';
import { TeamMember } from '@core/entity/teamMember';

import { App } from './app';
import { Project } from './project';
import { TeamAppInstallation } from './teamAppInstallation';
import { User } from './user';
import { TeamMemberGroup } from './teamMemberGroup';

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
    memberGroups: TeamMemberGroup[];
}
