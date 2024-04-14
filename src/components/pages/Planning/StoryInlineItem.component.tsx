import classNames from 'classnames';
import { SelectOwnersPopupComponent } from 'components/internal/SelectOwnersPopupComponent';
import { getUserShortName } from 'components/internal/format';
import {
    ChangeEvent,
    FunctionComponent,
    MouseEvent,
    useState,
} from 'react';

import { DropDownList, Option } from '@lib/ui/DropDownList';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TooltipUI } from '@lib/ui/Tooltip';
import { Deps } from '@core/dep/deps';
import { Priority } from '@core/entity/priority';
import { Story, StoryStatus } from '@core/entity/story';

import { UserProfileUI } from '../../internal/UserProfile';
import styles from './StoryInlineItem.component.module.scss';

interface StoryInlineItemComponentProps {
    story: Story;
    deps: Deps;
    isSelected?: boolean;
    onStoryDetailClickHandler: (storyId: number) => void;
    onStorySelectHandler: (storyId: number) => void;
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
        const [isEditingStory, setIsEditingStory] = useState(false);
        const [storyName, setStoryName] = useState(props.story.name);
        const priorityStyle = toOptionKey(props.story.priority);
        const handlePriorityChange = (optionKey: string) => {
            props.deps.stateSyncer.updateStory(props.story.id, {
                name: props.story.name,
                status: props.story.status,
                ownerId: props.story.owner?.id,
                priority: optionKeyToPriority[optionKey] as Priority,
            });
        };

        const handleStoryDetailClick = (event: MouseEvent) => {
            event.stopPropagation();
            props.onStoryDetailClickHandler(props.story.id);
        };

        const handleStoryClick = (event: MouseEvent) => {
            event.stopPropagation();
            props.onStorySelectHandler(props.story.id);
        };

        const onStoryDeleteClick = (event: MouseEvent<HTMLDivElement>) => {
            event.stopPropagation();
            props.deps.stateSyncer.deleteStory(props.story.id);
        };

        const onSelectStoryOwner = (ownerId?: number) => {
            props.deps.stateSyncer.updateStory(props.story.id, {
                name: props.story.name,
                status: props.story.status,
                priority: props.story.priority,
                ownerId,
            });
        };

        const onStoryNameChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
            setStoryName(event.target.value);
        };

        const onSaveStoryClick = () => {
            props.deps.stateSyncer.updateStory(props.story.id, {
                name: storyName,
                status: props.story.status,
                ownerId: props.story.owner?.id,
                priority: props.story.priority,
            });
            setIsEditingStory(false);
        };

        const onCancelStoryEdit = () => {
            setIsEditingStory(false);
        }

        const onStoryNameClick = () => {
            setIsEditingStory(true);
        }

        const renderAssignOwner = ({
            toggleContainer,
            showFollower,
        }: {
            toggleContainer: () => void;
            showFollower: boolean;
        }) => {
            const name = props.story.owner
                ? getUserShortName(
                      props.story.owner.firstName,
                      props.story.owner.lastName,
                  )
                : 'Unassigned';
            return (
                <div className={styles.AssignOwner}>
                    <TooltipUI
                        message={name}
                        relativeLayout={props.deps.relativeLayout}
                    >
                        <div
                            className={`${styles.Action} ${classNames({
                                [styles.Active]: showFollower,
                            })}`}
                            onClick={toggleContainer}
                        >
                            <div className={styles.AssignOwnerIcon}>
                                {props.story.owner ? (
                                    <UserProfileUI user={props.story.owner} />
                                ) : (
                                    <MaterialIconUI>face</MaterialIconUI>
                                )}
                            </div>
                        </div>
                    </TooltipUI>
                </div>
            );
        };

        return (
            <div>
                <div className={styles.InlineStory} onClick={handleStoryClick}>
                    <div
                        className={`${styles.Story} ${classNames({
                            [styles.Selected]: props.isSelected,
                        })}`}
                    >
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
                            {!isEditingStory ? (
                                <div className={styles.Goal} 
                                         onClick={onStoryNameClick}>
                                    {storyName}
                                </div>
                            ) : (
                                <textarea
                                    className={styles.TextArea}
                                    value={storyName}
                                    onChange={onStoryNameChange}
                                />
                            )}
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
                                    <TooltipUI
                                        message='Set Priority'
                                        relativeLayout={
                                            props.deps.relativeLayout
                                        }
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
                                    </TooltipUI>
                                </div>
                            </div>
                        </div>
                        <div className={styles.ActionsSection}>
                            {isEditingStory && (
                                <>
                                    <TooltipUI
                                        message={'Save'}
                                        relativeLayout={
                                            props.deps.relativeLayout
                                        }
                                    >
                                        <div
                                            className={styles.Action}
                                            onClick={onSaveStoryClick}
                                        >
                                            <div
                                                className={styles.SaveStoryIcon}
                                            >
                                                <MaterialIconUI>
                                                    done
                                                </MaterialIconUI>
                                            </div>
                                        </div>
                                    </TooltipUI>
                                    <TooltipUI
                                        message={'Cancel'}
                                        relativeLayout={
                                            props.deps.relativeLayout
                                        }
                                    >
                                        <div
                                            className={styles.Action}
                                            onClick={onCancelStoryEdit}
                                        >
                                            <div
                                                className={
                                                    styles.CancelEditStoryIcon
                                                }
                                            >
                                                <MaterialIconUI>
                                                    close
                                                </MaterialIconUI>
                                            </div>
                                        </div>
                                    </TooltipUI>
                                </>
                            )}
                            {!isEditingStory && (
                                <TooltipUI
                                    message={'Delete'}
                                    relativeLayout={props.deps.relativeLayout}
                                >
                                    <div className={styles.Action}>
                                        <div
                                            className={styles.DeleteStoryIcon}
                                            onClick={onStoryDeleteClick}
                                        >
                                            <MaterialIconUI>
                                                close
                                            </MaterialIconUI>
                                        </div>
                                    </div>
                                </TooltipUI>
                            )}
                            <SelectOwnersPopupComponent
                                deps={props.deps}
                                onSelectOwner={onSelectStoryOwner}
                                selectedOwnerId={props.story.owner?.id}
                                assignOwner={renderAssignOwner}
                            />
                            {!isEditingStory && (
                                <TooltipUI
                                    message={'Detail'}
                                    relativeLayout={props.deps.relativeLayout}
                                >
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
                            )}
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
