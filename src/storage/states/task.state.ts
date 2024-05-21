import { Duration, MILLIS_IN_NANOS } from '@lib/time/duration';

import { Priority } from '@core/entity/priority';
import { toDate } from '@core/storage/states/parser';
import { TaskStatus } from '@core/storage/states/taskStatus';

export class TaskState {
    public constructor(
        public id: number,
        public goal: string,
        public creatorUserId: number,
        public owningTeamId: number,
        public status: TaskStatus,
        public isScheduled: boolean,
        public isPlanned: boolean,
        public commentsThreadId: number,
        public createdAt: Date,
        public dueAt?: Date,
        public context?: string,
        public ownerUserId?: number,
        public effort?: Duration,
        public priority?: Priority,
        public updatedAt?: Date,
        public deliveredAt?: Date
    ) {}

    public static fromMutationPayload(json: any): TaskState {
        return new TaskState(
            json.ID,
            json.Goal,
            json.CreatorUserID,
            json.OwningTeamID,
            json.Status,
            json.IsScheduled,
            json.IsPlanned,
            json.CommentsThreadID,
            toDate(json.CreatedAt)!,
            toDate(json.DueAt),
            json.Context,
            json.OwnerUserID,
            json.Effort
                ? new Duration(json.Effort / MILLIS_IN_NANOS)
                : undefined,
            json.Priority,
            toDate(json.UpdatedAt),
            toDate(json.DeliveredAt),
        );
    }

    public static fromJson(json: any): TaskState {
        return new TaskState(
            json.id,
            json.goal,
            json.creatorUserId,
            json.owningTeamId,
            json.status,
            json.isScheduled,
            json.isPlanned,
            json.commentThreadId,
            toDate(json.createdAt)!,
            toDate(json.dueAt),
            json.context,
            json.ownerUserId,
            json.effort ? Duration.fromString(json.effort) : undefined,
            json.priority,
            toDate(json.updatedAt),
            toDate(json.deliveredAt),
        );
    }
}
