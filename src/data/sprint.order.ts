import { Sprint } from '@core/entity/sprint';

export function orderByStartTimeDesc(sprints: Sprint[]): Sprint[] {
    return sprints.sort(
        (sprint1, sprint2) => sprint2.endAt.getTime() - sprint1.endAt.getTime(),
    );
}
