import { UpdateTaskInput } from '@core/entity/input';
import { Invitation } from '@core/entity/invitation';
import { Task } from '@core/entity/task';

export type Feedback =
    | TaskUpdatedFeedback
    | UserProfileUpdatedFeedback
    | TeamProfileUpdatedFeedback
    | InvitationLinkCopiedFeedback;

export interface TaskUpdatedFeedback {
    type: 'TaskUpdated';
    taskId: number;
}

export interface UserProfileUpdatedFeedback {
    type: 'UserProfileUpdated';
}

export interface TeamProfileUpdatedFeedback {
    type: 'TeamProfileUpdated';
}

export interface InvitationLinkCopiedFeedback {
    type: 'InvitationLinkCopied';
    invitation: Invitation;
}
