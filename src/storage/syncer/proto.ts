import {
    TaskStatus as PBTaskStatus,
    PhaseStatus as PBPhaseStatus,
    StoryStatus as PBStoryStatus,
    Priority as PBPriority,
    Timestamp,
    Duration as PBDuration,
    AttachmentType as PBAttachmentType,
    AttachmentListOwnerType as PBAttachmentListOwnerType,
} from '@teamyapp/proto';
import { TaskStatus } from 'entity/taskStatus';
import { Priority } from 'entity/priority';
import { Duration } from '@lib/time/duration';
import { AttachmentType } from 'entity/attachment';
import { AttachmentListOwnerType } from 'entity/attachmentList';
import { PhaseStatus } from '@core/entity/phase';
import { StoryStatus } from '@core/entity/story';

export const protoAttachmentOwnerTypes: Record<AttachmentListOwnerType, PBAttachmentListOwnerType> = {
    TASK: PBAttachmentListOwnerType.TASK,
};

export const protoTaskStatuses: Record<TaskStatus, PBTaskStatus> = {
    TODO: PBTaskStatus.TODO,
    IN_PROGRESS: PBTaskStatus.IN_PROGRESS,
    PAUSED: PBTaskStatus.PAUSED,
    AWAITING: PBTaskStatus.AWAITING,
    BLOCKED: PBTaskStatus.BLOCKED,
    DELIVERED: PBTaskStatus.DELIVERED,
};

export const protoStoryStatuses: Record<StoryStatus, PBStoryStatus> = {
    TODO: PBStoryStatus.STORY_TODO,
    IN_PROGRESS: PBStoryStatus.STORY_IN_PROGRESS,
    PAUSED: PBStoryStatus.STORY_PAUSED,
    COMPLETED: PBStoryStatus.STORY_COMPLETED,
};

export const protoPriorities: Record<Priority, PBPriority> = {
    URGENT: PBPriority.URGENT,
    HIGH: PBPriority.HIGH,
    MEDIUM: PBPriority.MEDIUM,
    LOW: PBPriority.LOW,
};

export const protoPhaseStatuses: Record<PhaseStatus, PBPhaseStatus> = {
    TODO: PBPhaseStatus.PHASE_TODO,
    IN_PROGRESS: PBPhaseStatus.PHASE_IN_PROGRESS,
    PAUSED: PBPhaseStatus.PHASE_PAUSED,
    COMPLETED: PBPhaseStatus.PHASE_COMPLETED,
}

export const priorities: Record<PBPriority, Priority> = {
    [PBPriority.URGENT]: 'URGENT',
    [PBPriority.HIGH]: 'HIGH',
    [PBPriority.MEDIUM]: 'MEDIUM',
    [PBPriority.LOW]: 'LOW',
};

export const phaseStatues: Record<PBPhaseStatus, PhaseStatus> = {
    [PBPhaseStatus.PHASE_TODO]: 'TODO',
    [PBPhaseStatus.PHASE_IN_PROGRESS]: 'IN_PROGRESS',
    [PBPhaseStatus.PHASE_PAUSED]: 'PAUSED',
    [PBPhaseStatus.PHASE_COMPLETED]: 'COMPLETED',
};

export const storyStatuses: Record<PBStoryStatus, StoryStatus> = {
    [PBStoryStatus.STORY_TODO]: 'TODO',
    [PBStoryStatus.STORY_IN_PROGRESS]: 'IN_PROGRESS',
    [PBStoryStatus.STORY_PAUSED]: 'PAUSED',
    [PBStoryStatus.STORY_COMPLETED]: 'COMPLETED',
};

export const taskStatuses: Record<PBTaskStatus, TaskStatus> = {
    [PBTaskStatus.TODO]: 'TODO',
    [PBTaskStatus.IN_PROGRESS]: 'IN_PROGRESS',
    [PBTaskStatus.PAUSED]: 'PAUSED',
    [PBTaskStatus.AWAITING]: 'AWAITING',
    [PBTaskStatus.BLOCKED]: 'BLOCKED',
    [PBTaskStatus.DELIVERED]: 'DELIVERED',
};

export const attachmentTypes: Record<PBAttachmentType, AttachmentType> = {
    [PBAttachmentType.IMAGE]: 'IMAGE',
};

export const attachmentListOwnerTypes: Record<
    PBAttachmentListOwnerType,
    AttachmentListOwnerType
> = {
    [PBAttachmentListOwnerType.TASK]: 'TASK',
};

export function fromProtoTimePtr(ts?: Timestamp): Date | undefined {
    if (!ts) {
        return undefined;
    }

    return new Date(ts.seconds * 1_000 + ts.nanos / 1_000_000);
}

export function toProtoTimePtr(tm?: Date | null): Timestamp | undefined {
    if (!tm) {
        return undefined;
    }
    
    const seconds = Math.floor(tm.getTime() / 1_000);
    const nanos = (tm.getTime() % 1_000) * 1_000_000;
    return { seconds, nanos };
}

export function fromProtoDurationPtr(
    protoDuration?: PBDuration,
): Duration | undefined {
    if (!protoDuration) {
        return undefined;
    }

    return new Duration(
        protoDuration.seconds * 1_000 + protoDuration.nanos / 1_000_000,
    );
}

export function toProtoDurationPtr(
    duration?: Duration | null,
): PBDuration | undefined {
    if (!duration) {
        return undefined;
    }

    const seconds = Math.floor(duration.totalMilliSeconds / 1000);
    const nanos = (duration.totalMilliSeconds % 1_000) * 1_000_000;
    return { seconds, nanos };
}

export function toProtoPriorityPtr(
    priority?: Priority | null,
): PBPriority | undefined {
    if (!priority) {
        return undefined;
    }
    
    return protoPriorities[priority];
}

export function fromProtoPriorityPtr(
    protoPriority?: PBPriority,
): Priority | undefined {
    if (!protoPriority) {
        return undefined;
    }
    
    return priorities[protoPriority];
}
