import { Option } from '@lib/ui/DropDownList';

export const taskPriorityOrder = 'priority';
export const taskUrgencyOrder = 'urgency';
export const taskValueOrder = 'value';
export const taskEffortOrder = 'effort';

export const upcomingSortOrders: Option[] = [
    {
        key: taskPriorityOrder,
        description: 'Priority',
    },
    {
        key: taskUrgencyOrder,
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
