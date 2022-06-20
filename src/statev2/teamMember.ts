import { Attributes } from '@lib/storage/mutation';

export class TeamMember {
    constructor(public teamId: number, public userId: number) {}

    static fromAttributes(attributes: Attributes): TeamMember {
        return new TeamMember(
            parseInt(attributes.TeamID),
            parseInt(attributes.UserID),
        );
    }
}
