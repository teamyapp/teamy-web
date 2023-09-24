// type App {
//     id: ID!
//     secrets: [AppSecret!]!
//     totalInstallations: Int!
//     installations: [TeamAppInstallation!]!
//     versions: [AppVersion!]!
//     userGroups: [Group!]!
//     teamGroups: [Group!]!
//     userRollouts: [Rollout!]!
//     teamRollouts: [Rollout!]!
//     managedByTeam: Team!
// }
import { AppSecret } from '@core/entity/appSecret';
import { AppVersion } from '@core/entity/appVersion';
import { Team } from '@core/entity/team';

export interface App {
    id: number;
    secrets: AppSecret[];
    totalInstallations: number;
    // installations: TeamAppInstallation[];
    versions: AppVersion[];
    // userGroups: Group[];
    // teamGroups: Group[];
    // userRollouts: Rollout[];
    // teamRollouts: Rollout[];
    // managedByTeam: Team;
}
