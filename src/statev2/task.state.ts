import { Attributes } from '@lib/storage/mutation';

import { toDate, toInt } from '@core/statev2/parser';
import { TaskStatus } from '@core/statev2/taskStatus';

export class TaskState {
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

    public static fromAttributes(attributes: Attributes): TaskState {
        return new TaskState(
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

    public static fromJson(json: any): TaskState {
        return new TaskState(
          json.id,
          json.goal,
          json.creatorUserId,
          json.owningTeamId,
          json.status,
          json.commentThreadId,
          toDate(json.createdAt)!,
          toDate(json.dueAt),
          json.context,
          json.ownerUserId,
          json.effort,
          toDate(json.updatedAt))
    }
}
