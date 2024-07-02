import {
    orderByDeadline,
    orderByEffort,
    orderById,
    orderByOwner,
    orderByPriorityDesc,
    orderByValue,
} from '@core/data/task.order';
import { Priority } from '@core/entity/priority';
import { Story, StoryStatus } from '@core/entity/story';
import { Task } from '@core/entity/task';
import { SortOrder } from '@lib/data/order';
import { Option } from '@lib/ui/DropDownList';

export const taskStatusOrder = 'status';
export const taskPriorityOrder = 'priority';
export const taskDeadlineOrder = 'deadline';
export const taskOwnerOrder = 'owner';
export const taskValueOrder = 'value';
export const taskEffortOrder = 'effort';

export const backlogSortOrders: Option[] = [
    {
        key: taskStatusOrder,
        description: 'Status',
    },
    {
        key: taskPriorityOrder,
        description: 'Priority',
    },
    {
        key: taskOwnerOrder,
        description: 'Owner',
    },
    {
        key: taskDeadlineOrder,
        description: 'Deadline',
    },
];

export const upcomingSortOrders: Option[] = [
    {
        key: taskPriorityOrder,
        description: 'Priority',
    },
    {
        key: taskOwnerOrder,
        description: 'Owner',
    },
    {
        key: taskDeadlineOrder,
        description: 'Deadline',
    },
    // {
    //     key: taskValueOrder,
    //     description: 'Value',
    // },
    // {
    //     key: taskEffortOrder,
    //     description: 'Effort',
    // },
];

export const deliveredSortOrders: Option[] = [
    {
        key: taskPriorityOrder,
        description: 'Priority',
    },
    {
        key: taskOwnerOrder,
        description: 'Owner',
    },
    {
        key: taskDeadlineOrder,
        description: 'Deadline',
    },
];

const priorityToOrderNumber: Record<Priority, number> = {
    URGENT: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
};

const storyStatusToOrderNumber: Record<StoryStatus, number> = {
    COMPLETED: 0,
    IN_PROGRESS: 1,
    PAUSED: 2,
    TODO: 3,
};

export const sortByStoryId = (storyA: Story, storyB: Story) => {
    return storyA.id - storyB.id;
};

export const sortByStoryName = (storyA: Story, storyB: Story) => {
    return storyA.name.localeCompare(storyB.name);
};

export const sortByStoryPriority = (storyA: Story, storyB: Story) => {
    const priorityAOrderNumber = storyA.priority
        ? priorityToOrderNumber[storyA.priority]
        : 4;
    const priorityBOrderNumber = storyB.priority
        ? priorityToOrderNumber[storyB.priority]
        : 4;

    return priorityAOrderNumber - priorityBOrderNumber;
};

export const sortByStoryStatus = (storyA: Story, storyB: Story) => {
    const statusAOrderNumber = storyStatusToOrderNumber[storyA.status];
    const statusBOrderNumber = storyStatusToOrderNumber[storyB.status];
    return statusAOrderNumber - statusBOrderNumber;
};

export function getSortOrder(sortOrder?: string): SortOrder<Task> {
    switch (sortOrder) {
        case taskPriorityOrder:
            return orderByPriorityDesc;
        case taskOwnerOrder:
            return orderByOwner;
        case taskDeadlineOrder:
            return orderByDeadline;
        case taskValueOrder:
            return orderByValue;
        case taskEffortOrder:
            return orderByEffort;
        default:
            return orderById;
    }
}
