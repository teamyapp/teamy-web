import { StoryStatus as Status } from '@core/entity/story';
import { FC } from 'react';
import styles from './StoryStatus.component.module.scss';

const statusNames: Record<Status, string> = {
    TODO: 'Todo',
    PAUSED: 'Paused',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
};

interface Props {
    status: Status;
}

export const StoryStatus: FC<Props> = (props) => {
    return (
        <div className={`${styles.Status} ${styles[props.status]}`}>
            {statusNames[props.status]}
        </div>
    );
};
