import { Attributes } from '@lib/storage/mutation';

import { toDate, toInt } from '@core/statev2/parser';
import { TaskStatus } from '@core/statev2/taskStatus';

export class Task {
    constructor(
        public id: number,
        public goal: string,
        public creatorUserId: number,
        public owningTeamId: number,
        public status: TaskStatus,
        public commentThreadId: number,
        public createdAt: Date,
        public dueAt?: Date,
        public context?: string,
        public ownerUserId?: number,
        public effort?: number,
        public updatedAt?: Date,
    ) {}

    static fromAttributes(attributes: Attributes): Task {
        return new Task(
            parseInt(attributes.ID),
            attributes.Goal,
            parseInt(attributes.CreatorUserID),
            parseInt(attributes.OwningTeamID),
            attributes.Status as TaskStatus,
            parseInt(attributes.CommentThreadID),
            toDate(attributes.CreatedAt)!,
            toDate(attributes.DueAt),
            attributes.Context,
            toInt(attributes.OwnerUserId),
            toInt(attributes.effort),
            toDate(attributes.UpdatedAt),
        );
    }
}
