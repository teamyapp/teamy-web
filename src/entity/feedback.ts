import { Invitation } from '@core/entity/invitation';
import { ReactNode } from 'react';

export type Feedback =
    | TaskUpdatedFeedback
    | StoryUpdatedFeedback
    | UserProfileUpdatedFeedback
    | TeamProfileUpdatedFeedback
    | InvitationLinkCopiedFeedback
    | AppSecretCopiedFeedback
    | ErrorFeedback;

export interface ErrorFeedback {
    type: 'Error';
    children?: ReactNode,
}

export interface TaskUpdatedFeedback {
    type: 'TaskUpdated';
    taskId: number;
}

export interface StoryUpdatedFeedback {
    type: "StoryUpdated";
    storyId: number;
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

export interface AppSecretCopiedFeedback {
    type: 'AppSecretCopied';
    appSecretId: number;
}
