import { Priority } from '@core/entity/priority';
import { DropDownList, Option } from '@lib/ui/DropDownList';
import { FC } from 'react';
import styles from './StoryPriority.component.module.scss';
import classNames from 'classnames';
import { RelativeLayout } from '@lib/layout';

interface Props {
    relativeLayout: RelativeLayout;
    priority?: Priority;
    onPriorityChange: (priority: Priority) => void;
}

const priorityOptions: Option[] = [
    {
        key: 'unset',
        description: '',
    },
    {
        key: 'urgent',
        description: 'Urgent',
    },
    {
        key: 'high',
        description: 'High',
    },
    {
        key: 'medium',
        description: 'Medium',
    },
    {
        key: 'low',
        description: 'Low',
    },
];

export const StoryPriority: FC<Props> = (props) => {
    const priorityStyle = toOptionKey(props.priority);
    const handlePriorityChange = (optionKey: string) => {
        const priority = optionKeyToPriority[optionKey];
        props.onPriorityChange(priority);
    };

    return (
        <div
            className={`${styles.Priority} ${classNames({
                [styles[priorityStyle]]: true,
            })}`}
        >
            <DropDownList
                relativeLayout={props.relativeLayout}
                selectOptionKey={toOptionKey(props.priority)}
                options={priorityOptions}
                onSelectOption={handlePriorityChange}
            />
        </div>
    );
};

const priorityToOptionKey: Record<Priority, string> = {
    URGENT: 'urgent',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
};

const optionKeyToPriority: Record<string, Priority> = {
    urgent: 'URGENT',
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
};

function toOptionKey(priority?: Priority): string {
    if (!priority) {
        return 'unset';
    }

    return priorityToOptionKey[priority];
}
