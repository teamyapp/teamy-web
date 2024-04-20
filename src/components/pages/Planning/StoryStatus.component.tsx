import { StoryStatus as Status } from '@core/entity/story';
import { FC } from 'react';
import styles from './StoryStatus.component.module.scss';
import { DropDownList, Option } from '@lib/ui/DropDownList';
import classNames from 'classnames';
import { RelativeLayout } from '@lib/layout';

const statusNames: Record<Status, string> = {
    TODO: 'Todo',
    PAUSED: 'Paused',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
};

const statusOptions: Option[] = [
    {
        key: 'todo',
        description: 'Todo',
    },
    {
        key: 'paused',
        description: 'Paused',
    },
    {
        key: 'inProgress',
        description: 'In Progress',
    },
    {
        key: 'completed',
        description: 'Completed',
    },
];

const statusToOptionKey: Record<Status, string> = {
    TODO: 'todo',
    PAUSED: 'paused',
    IN_PROGRESS: 'inProgress',
    COMPLETED: 'completed',
};

const optionKeyToStatus: Record<string, Status> = {
    todo: 'TODO',
    paused: 'PAUSED',
    inProgress: 'IN_PROGRESS',
    completed: 'COMPLETED',
};

const toOptionKey = (status: Status): string => {
    return statusToOptionKey[status];
};

interface Props {
    status: Status;
    onStatusChange: (status: Status) => void;
    relativeLayout: RelativeLayout;
}

export const StoryStatus: FC<Props> = (props) => {
    const statusStyle = toOptionKey(props.status);
    const handleStatusChange = (optionKey: string) => {
        const status = optionKeyToStatus[optionKey];
        props.onStatusChange(status);
    };

    return (
        <div
            className={`${styles.Status} ${classNames({
                [styles[statusStyle]]: true,
            })}`}
        >
            <DropDownList
                relativeLayout={props.relativeLayout}
                selectOptionKey={toOptionKey(props.status)}
                options={statusOptions}
                onSelectOption={handleStatusChange}
            />
        </div>
    );
};
