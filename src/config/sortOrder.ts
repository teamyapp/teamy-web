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
