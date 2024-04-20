import { Priority } from '@core/entity/priority';
import { Story, StoryStatus } from '@core/entity/story';
import { Option } from '@lib/ui/DropDownList';

export const taskPriorityOrder = 'priority';
export const taskDeadlineOrder = 'deadline';
export const taskOwnerOrder = 'owner';
export const taskValueOrder = 'value';
export const taskEffortOrder = 'effort';

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

const priorityToOrderNumber: Record<Priority, number> = {
    URGENT: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
};

const storyStatusToOrderNumber: Record<StoryStatus, number> = {
    TODO: 0,
    IN_PROGRESS: 1,
    PAUSED: 2,
    COMPLETED: 3,
};

export const sortByStoryId = (storyA: Story, storyB: Story) => {
    return storyA.id - storyB.id;
};

export const sortByStoryName = (storyA: Story, storyB: Story) => {
    return storyA.name.localeCompare(storyB.name);
}

export const sortByStoryPriority = (storyA: Story, storyB: Story) => {
    const priorityAOrderNumber = storyA.priority
        ? priorityToOrderNumber[storyA.priority]
        : -1;
    const priorityBOrderNumber = storyB.priority
        ? priorityToOrderNumber[storyB.priority]
        : -1;
    debugger
    return priorityAOrderNumber - priorityBOrderNumber;
};

export const sortByStoryStatus = (storyA: Story, storyB: Story) => {
    const statusAOrderNumber = storyStatusToOrderNumber[storyA.status];
    const statusBOrderNumber = storyStatusToOrderNumber[storyB.status];
    return statusAOrderNumber - statusBOrderNumber;
};
