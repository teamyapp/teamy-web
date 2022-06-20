import { Attributes } from '@lib/storage/mutation';

import { toDate } from '@core/statev2/parser';

export class TaskAwaitForRelation {
    constructor(
        public awaitingTaskId: number,
        public awaitForTaskId: number,
        public createdAt: Date,
    ) {}

    static fromAttributes(attributes: Attributes): TaskAwaitForRelation {
        return new TaskAwaitForRelation(
            parseInt(attributes.AwaitingTaskID),
            parseInt(attributes.AwaitForTaskID),
            toDate(attributes.CreatedAt)!,
        );
    }
}
