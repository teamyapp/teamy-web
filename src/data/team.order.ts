import { SortOrder } from '@lib/data/order';

import { Team } from '@core/entity/team';

export const orderByName: SortOrder<Team> = (
    team1: Team,
    team2: Team,
): number => {
    if (team1.name === team2.name) {
        return team1.id - team2.id;
    }

    return team1.name < team2.name ? -1 : 1;
};
