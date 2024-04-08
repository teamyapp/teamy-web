import classNames from 'classnames';
import { SelectOwnersPopupComponent } from 'components/internal/SelectOwnersPopupComponent';
import { UserProfileUI } from 'components/internal/UserProfile';
import { getUserShortName } from 'components/internal/format';
import { ChangeEvent, FC, MouseEvent, useRef, useState } from 'react';

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
    const getBindingClientRectRef = useRef<() => DOMRect>();
    const [isSelectingOwner, setIsSelectingOwner] = useState(false);
    const selectOwnerPopupRef = useRef<SelectOwnersPopupComponent>(null);

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
    }

    const onCancelEditStoryClick = () => {
        props.onDiscardNewStory?.call(null);
    }

    const onAssignOwnerClick = (event: MouseEvent<HTMLDivElement>) => {
        const element = event.currentTarget as HTMLDivElement;
        getBindingClientRectRef.current =
            element.getBoundingClientRect.bind(element);

        selectOwnerPopupRef.current?.show.call(null);
        setIsSelectingOwner(true);

    }

    const onStoryOwnersPopupClose = () => {
        setIsSelectingOwner(false);
    }

    const onSelectStoryOwner = (ownerId?: number) => {
        debugger
        setStory({
            ...story,
            ownerId: ownerId || 0,
        });
        setIsSelectingOwner(false);
    }

    const renderAssignOwner = () => {
        const owner = story.ownerId && props.deps.graphSource.user(story.ownerId);
        const name = owner
            ? getUserShortName(owner.firstName, owner.lastName)
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
        <>
            <div className={styles.Story}>
                <div className={styles.LeftSection}>
                    <textarea
                        className={styles.Goal}
                        autoFocus
                        maxLength={storyNameLengthLimit}
                        value={story.name || ''}
                        onChange={onNameChange}
                    />
                </div>
                <div className={styles.ActionsSection}
                     style={{
                         gridTemplateColumns: `repeat(${
                             props.numActionColumns || 3
                         }, 1fr)`,
                     }}>
                    <div>
                        <TooltipUI message={'Save'}>
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
                        <TooltipUI message={'Cancel'}>
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
                    {renderAssignOwner()}
                </div>
            </div>
            <SelectOwnersPopupComponent
                ref={selectOwnerPopupRef}
                deps={props.deps}
                findOwnersAlignTargetBoundBox={getBindingClientRectRef.current}
                onClose={onStoryOwnersPopupClose}
                onSelectOwner={onSelectStoryOwner}
                selectedOwnerId={story.ownerId}
            />
        </>
    );
};