import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { DragAndDropController } from '@lib/dragAndDrop/DragAndDropController';
import { DropDownList, Option } from '@lib/ui/DropDownList';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TooltipUI } from '@lib/ui/Tooltip';

import { DragAndDropContext } from '@core/config/dragAndDrop';
import { Priority } from '@core/entity/priority';
import { Story, StoryStatus } from '@core/entity/story';

import { UserProfileUI } from '../../internal/UserProfile';
import styles from './StoryInlineItem.module.scss';

interface StoryInlineItemComponentProps {
    story: Story;
    onClickStoryDetailHandler: (storyId: number) => void;
}

const statusNames: Record<StoryStatus, string> = {
    TODO: 'Todo',
    PAUSED: 'Paused',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
};

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

export const StoryInlineItemComponent: FunctionComponent<StoryInlineItemComponentProps> =
    (props: StoryInlineItemComponentProps) => {
        const priorityStyle = toOptionKey(props.story.priority);
        const handlePriorityChange = (optionKey: string) => {};

        const handleStoryDetailClick = () => {
            props.onClickStoryDetailHandler(props.story.id);
        };

        return (
            
                <div>
                    <div className={styles.InlineStory}>
                        <div className={styles.Story}>
                            <div className={styles.LeftSection}>
                                <div className={styles.TopRow}>
                                    <div
                                        className={`${styles.Attribute} ${styles.Id}`}
                                    >
                                        {props.story.id}
                                    </div>

                                    <div
                                        className={`${styles.Attribute} ${
                                            styles.Status
                                        } ${styles[props.story.status]}`}
                                    >
                                        {statusNames[props.story.status]}
                                    </div>
                                </div>
                                <div className={styles.Goal}>
                                    {props.story.name}
                                </div>
                                <div className={styles.CompletionStatus}>
                                    {props.story.completedTasks} of{' '}
                                    {props.story.totalTasks} tasks completed
                                </div>

                                <div className={styles.BottomRow}>
                                    <div
                                        className={`${styles.Attribute} ${
                                            styles.Priority
                                        } ${classNames({
                                            [styles[priorityStyle]]: true,
                                        })}`}
                                    >
                                        <DropDownList
                                            selectOptionKey={toOptionKey(
                                                props.story.priority,
                                            )}
                                            options={priorityOptions}
                                            onSelectOption={
                                                handlePriorityChange
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.ActionsSection}>
                                <TooltipUI message={'Delete'}>
                                    <div className={styles.Action}>
                                        <div className={styles.DeleteStoryIcon}>
                                            <MaterialIconUI>
                                                close
                                            </MaterialIconUI>
                                        </div>
                                    </div>
                                </TooltipUI>

                                <div className={styles.AssignOwner}>
                                    <TooltipUI
                                        message={props.story.owner.fullName}
                                    >
                                        <div className={styles.Action}>
                                            <div
                                                className={
                                                    styles.AssignOwnerIcon
                                                }
                                            >
                                                {props.story.owner ? (
                                                    <UserProfileUI
                                                        user={props.story.owner}
                                                    />
                                                ) : (
                                                    <MaterialIconUI>
                                                        face
                                                    </MaterialIconUI>
                                                )}
                                            </div>
                                        </div>
                                    </TooltipUI>
                                </div>
                                <TooltipUI message={'Detail'}>
                                    <div
                                        className={styles.Action}
                                        onClick={handleStoryDetailClick}
                                    >
                                        <div
                                            className={
                                                styles.ViewStoryDetailIcon
                                            }
                                        >
                                            <MaterialIconUI>
                                                settings
                                            </MaterialIconUI>
                                        </div>
                                    </div>
                                </TooltipUI>
                            </div>
                        </div>
                    </div>
                </div>
      
        );
    };

const priorityToOptionKey: Record<Priority, string> = {
    URGENT: 'urgent',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
};

function toOptionKey(priority?: Priority): string {
    if (!priority) {
        return 'unset';
    }

    return priorityToOptionKey[priority];
}
