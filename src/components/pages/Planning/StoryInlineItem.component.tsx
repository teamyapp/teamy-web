import classNames from 'classnames';
import { SelectOwnersPopupComponent } from 'components/internal/SelectOwnersPopupComponent';
import { ChangeEvent, FunctionComponent, MouseEvent, useState } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TooltipUI } from '@lib/ui/Tooltip';
import { Deps } from '@core/dep/deps';
import { Story, StoryStatus } from '@core/entity/story';
import styles from './StoryInlineItem.component.module.scss';
import { StoryPriority } from './StoryPriority.component';
import { Priority } from '@core/entity/priority';
import { StoryStatusComponent } from './StoryStatus.component';

interface StoryInlineItemComponentProps {
    story: Story;
    deps: Deps;
    isSelected?: boolean;
    onStoryDetailClickHandler: (storyId: number) => void;
    onStorySelectHandler: (storyId: number) => void;
}

export const StoryInlineItemComponent: FunctionComponent<
    StoryInlineItemComponentProps
> = (props: StoryInlineItemComponentProps) => {
    const [isEditingStory, setIsEditingStory] = useState(false);
    const [storyName, setStoryName] = useState(props.story.name);
    const handlePriorityChange = (priority: Priority) => {
        props.deps.stateSyncer.updateStory(props.story.id, {
            name: props.story.name,
            status: props.story.status,
            ownerId: props.story.owner?.id,
            priority,
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

    const onStatusChange = (status: StoryStatus) => {
        props.deps.stateSyncer.updateStory(props.story.id, {
            name: props.story.name,
            status,
            ownerId: props.story.owner?.id,
            priority: props.story.priority,
        });
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

    const onSaveStoryClick = (event: MouseEvent) => {
        event.stopPropagation();
        props.deps.stateSyncer.updateStory(props.story.id, {
            name: storyName,
            status: props.story.status,
            ownerId: props.story.owner?.id,
            priority: props.story.priority,
        });
        setIsEditingStory(false);
        props.deps.feedbackPubSub.publish({
            type: 'StoryUpdated',
            storyId: props.story.id,
        });
    };

    const onCancelStoryEdit = (event: MouseEvent) => {
        event.stopPropagation();
        setIsEditingStory(false);
    };

    const onStoryNameDoubleClick = (event: MouseEvent) => {
        event.stopPropagation();
        setIsEditingStory(true);
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
                            <div className={`${styles.Attribute} ${styles.Id}`}>
                                {props.story.id}
                            </div>
                            <StoryStatusComponent
                                status={props.story.status}
                                onStatusChange={onStatusChange}
                                relativeLayout={props.deps.relativeLayout}
                            />
                        </div>
                        {isEditingStory ? (
                            <textarea
                                className={styles.TextArea}
                                value={storyName}
                                onChange={onStoryNameChange}
                            />
                        ) : (
                            <div
                                className={styles.Goal}
                                onDoubleClick={onStoryNameDoubleClick}
                            >
                                {storyName}
                            </div>
                        )}
                        <div className={styles.CompletionStatus}>
                            {props.story.completedTasks} of{' '}
                            {props.story.totalTasks} tasks completed
                        </div>
                        <div className={styles.BottomRow}>
                            <StoryPriority
                                relativeLayout={props.deps.relativeLayout}
                                onPriorityChange={handlePriorityChange}
                                priority={props.story.priority}
                                transformReferenceContainer={({showFollower, container}) => (
                                    <TooltipUI
                                        message="Priority"
                                        disabled={showFollower}
                                        relativeLayout={props.deps.relativeLayout}
                                    >
                                        {container}
                                    </TooltipUI>
                                )}
                            />
                        </div>
                    </div>
                    <div className={styles.ActionsSection}>
                        {isEditingStory && (
                            <>
                                <TooltipUI
                                    message={'Save'}
                                    relativeLayout={props.deps.relativeLayout}
                                >
                                    <div
                                        className={styles.Action}
                                        onClick={onSaveStoryClick}
                                    >
                                        <div className={styles.SaveStoryIcon}>
                                            <MaterialIconUI>
                                                done
                                            </MaterialIconUI>
                                        </div>
                                    </div>
                                </TooltipUI>
                                <TooltipUI
                                    message={'Cancel'}
                                    relativeLayout={props.deps.relativeLayout}
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
                                        <MaterialIconUI>close</MaterialIconUI>
                                    </div>
                                </div>
                            </TooltipUI>
                        )}
                        <SelectOwnersPopupComponent
                            deps={props.deps}
                            onSelectOwner={onSelectStoryOwner}
                            selectedOwner={props.story.owner}
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
                                    <div className={styles.ViewStoryDetailIcon}>
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
