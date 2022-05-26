import { Team } from '@core/entityv2/team';
import { User } from '@core/entityv2/user';

export interface CreateTeamInput {
    name: string;
}

export interface UpdateTeamInput {
    name: string;
    iconUrl?: string;
    ownerUserId: number;
}

export class TeamClient {
    createTeam(team: CreateTeamInput): Promise<Team> {
        // TODO: implement me
    }

    updateTeam(teamId: number, input: UpdateTeamInput): Promise<Team> {
        // TODO: implement me
    }

    getTeamMembers(teamId: number): Promise<User[]> {
        // TODO: implement me
    }

    addMemberToTeam(teamId: number, memberUserId: number): Promise<Team> {
        // TODO: implement me
    }

    removeMemberFromTeam(teamId: number, memberUserId: number): Promise<Team> {
        // TODO: implement me
    }
}
