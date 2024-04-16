import classNames from 'classnames';
import { SelectOwnersPopupComponent } from 'components/internal/SelectOwnersPopupComponent';
import { UserProfileUI } from 'components/internal/UserProfile';
import { getUserShortName } from 'components/internal/format';
import { ChangeEvent, FC, useState } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TooltipUI } from '@lib/ui/Tooltip';

import { Deps } from '@core/dep/deps';
import { CreateStoryInput } from '@core/entity/input';

import styles from './InlineCreateStory.component.module.scss';

const storyNameLengthLimit = 100;
interface Props {
    deps: Deps;
    numActionColumns?: number;
    initialOwnerId?: number;
    onCreateStory?: (story: CreateStoryInput) => void;
    onDiscardNewStory?: () => void;
}

export const InlineCreateStory: FC<Props> = (props) => {
    const [story, setStory] = useState<CreateStoryInput>({
        name: '',
        ownerId: props.initialOwnerId || 0,
    });

    const onNameChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setStory({
            ...story,
            name: event.target.value,
        });
    };

    const onSaveStoryClick = () => {
        if (story.name) {
            props.onCreateStory?.call(null, story);
        } else {
            props.onDiscardNewStory?.call(null);
        }
    };

    const onCancelEditStoryClick = () => {
        props.onDiscardNewStory?.call(null);
    };

    const onSelectStoryOwner = (ownerId?: number) => {
        setStory({
            ...story,
            ownerId: ownerId || 0,
        });
    };

    const renderAssignOwner = ({
        toggleContainer,
        showFollower,
    }: {
        toggleContainer: () => void;
        showFollower: boolean;
    }) => {
        const owner =
            story.ownerId && props.deps.graphSource.user(story.ownerId);
        const name = owner
            ? getUserShortName(owner.firstName, owner.lastName)
            : 'Unassigned';
        return (
            <div className={styles.AssignOwner}>
                <TooltipUI message={name} relativeLayout={props.deps.relativeLayout}>
                    <div
                        className={`${styles.Action} ${classNames({
                            [styles.Active]: showFollower,
                        })}`}
                        onClick={toggleContainer}
                    >
                        <div className={styles.AssignOwnerIcon}>
                            {story.ownerId && owner ? (
                                <UserProfileUI user={owner} />
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
        <div className={styles.Story}>
            <div className={styles.LeftSection}>
                <textarea
                    className={styles.TextArea}
                    autoFocus
                    maxLength={storyNameLengthLimit}
                    value={story.name || ''}
                    onChange={onNameChange}
                />
            </div>
            <div
                className={styles.ActionsSection}
                style={{
                    gridTemplateColumns: `repeat(${
                        props.numActionColumns || 3
                    }, 1fr)`,
                }}
            >
                <div>
                    <TooltipUI message={'Save'} relativeLayout={props.deps.relativeLayout}>
                        <div
                            className={styles.Action}
                            onClick={onSaveStoryClick}
                        >
                            <div className={styles.SaveStoryIcon}>
                                <MaterialIconUI>done</MaterialIconUI>
                            </div>
                        </div>
                    </TooltipUI>
                </div>
                <div>
                    <TooltipUI message={'Cancel'} relativeLayout={props.deps.relativeLayout}>
                        <div
                            className={styles.Action}
                            onClick={onCancelEditStoryClick}
                        >
                            <div className={styles.CancelEditStoryIcon}>
                                <MaterialIconUI>close</MaterialIconUI>
                            </div>
                        </div>
                    </TooltipUI>
                </div>
                <SelectOwnersPopupComponent
                    deps={props.deps}
                    onSelectOwner={onSelectStoryOwner}
                    selectedOwnerId={story.ownerId}
                    assignOwner={renderAssignOwner}
                />
            </div>
        </div>
    );
};
