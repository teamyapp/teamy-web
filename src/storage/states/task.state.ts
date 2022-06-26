import { toDate } from '@core/storage/states/parser';
import { TaskStatus } from '@core/storage/states/taskStatus';

export class TaskState {
    public constructor(
        public id: number,
        public goal: string,
        public creatorUserId: number,
        public owningTeamId: number,
        public status: TaskStatus,
        public commentsThreadId: number,
        public createdAt: Date,
        public dueAt?: Date,
        public context?: string,
        public ownerUserId?: number,
        public effort?: number,
        public updatedAt?: Date,
    ) {}

    public static fromMutationPayload(json: any): TaskState {
        return new TaskState(
            json.ID,
            json.Goal,
            json.CreatorUserID,
            json.OwningTeamID,
            json.Status as TaskStatus,
            json.CommentsThreadID,
            toDate(json.CreatedAt)!,
            toDate(json.DueAt),
            json.Context,
            json.OwnerUserID,
            json.Effort,
            toDate(json.UpdatedAt),
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
            toDate(json.updatedAt),
        );
    }
}
