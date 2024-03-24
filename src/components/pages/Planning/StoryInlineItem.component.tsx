import classNames from 'classnames';
import { SelectOwnersPopupComponent } from 'components/internal/SelectOwnersPopupComponent';
import { getUserShortName } from 'components/internal/format';
import { FunctionComponent, MouseEvent, useRef, useState } from 'react';

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
        const getBindingClientRectRef = useRef<() => DOMRect>();
        const [isSelectingOwner, setIsSelectingOwner] = useState(false);
        const selectOwnerPopupRef = useRef<SelectOwnersPopupComponent>(null);
        const priorityStyle = toOptionKey(props.story.priority);
        const handlePriorityChange = (optionKey: string) => {};

        const handleStoryDetailClick = (event: MouseEvent) => {
            event.stopPropagation();
            props.onStoryDetailClickHandler(props.story.id);
        };

        const handleStoryClick = (event: MouseEvent) => {
            event.stopPropagation();
            props.onStorySelectHandler(props.story.id);
        };

        const onAssignOwnerClick = (event: MouseEvent<HTMLDivElement>) => {
            const element = event.currentTarget as HTMLDivElement;
            getBindingClientRectRef.current = element.getBoundingClientRect.bind(
                element,
            );

            selectOwnerPopupRef.current?.show.call(null);
            setIsSelectingOwner(true);
        };

        const onStoryOwnersPopupClose = () => {
            setIsSelectingOwner(false);
        };

        const onSelectStoryOwner = (ownerId?: number) => {
            setIsSelectingOwner(false);
        };

        const renderAssignOwner = () => {
            const name = props.story.owner
                ? getUserShortName(
                      props.story.owner.firstName,
                      props.story.owner.lastName,
                  )
                : 'Unassigned';
            return (
                <div className={styles.AssignOwner}>
                    <TooltipUI message={name}>
                        <div
                            className={`${styles.Action} ${classNames({
                                [styles.Active]: isSelectingOwner,
                            })}`}
                            onClick={onAssignOwnerClick}
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
            <>
                <div>
                    <div
                        className={styles.InlineStory}
                        onClick={handleStoryClick}
                    >
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
                                {renderAssignOwner()}
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
                <SelectOwnersPopupComponent
                    ref={selectOwnerPopupRef}
                    deps={props.deps}
                    findOwnersAlignTargetBoundBox={getBindingClientRectRef.current}
                    onClose={onStoryOwnersPopupClose}
                    onSelectOwner={onSelectStoryOwner}
                    selectedOwnerId={props.story.owner.id}
                />
            </>
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
