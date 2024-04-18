import { Deps } from '@core/dep/deps';
import { CreateStoryInput, UpdateStoryInput } from '@core/entity/input';
import { Story } from '@core/entity/story';
import { ChangeEvent, FC, useState } from 'react';
import styles from './StoryTable.component.module.scss';
import { StoryPriority } from './StoryPriority.component';
import { Priority } from '@core/entity/priority';
import { StoryStatus } from './StoryStatus.component';
import { SelectOwnersPopupComponent } from 'components/internal/SelectOwnersPopupComponent';
import { TooltipUI } from '@lib/ui/Tooltip';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

interface Props {
    stories: Story[];
    deps: Deps;
    creatingNewStory: boolean;
    cancelCreatingNewStory: () => void;
    saveCreatingNewStory: (story: CreateStoryInput) => void;
    onStorySelect: (storyId: number) => void;
    selectedStoryIds: Set<string>;
}

export const StoryTable: FC<Props> = (props) => {
    const [editingStoryInputs, setEditingStoryInputs] = useState<
        Record<number, UpdateStoryInput>
    >({});
    const [creatingStoryInput, setCreatingStoryInput] =
        useState<CreateStoryInput>();

    const onSelectStoryChecked = (storyId: number) => () => {
        props.onStorySelect(storyId);
    };

    const onSaveCreatingStoryClick = () => {
        if (!creatingStoryInput) {
            return;
        }

        props.saveCreatingNewStory(creatingStoryInput);
        setCreatingStoryInput(undefined);
    };

    const onCancelCreatingStoryClick = () => {
        setCreatingStoryInput(undefined);
        props.cancelCreatingNewStory();
    };

    const onCreatingStoryNameChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const storyName = event.target.value;

        setCreatingStoryInput({
            ...creatingStoryInput,
            name: storyName,
        });
    };

    const onSelectCreatingStoryOwner = (ownerId?: number) => {
        setCreatingStoryInput({
            ...creatingStoryInput,
            name: creatingStoryInput?.name ?? '',
            ownerId,
        });
    };

    const onCreatingStoryPriorityChange = (priority: Priority) => {
        setCreatingStoryInput({
            ...creatingStoryInput,
            name: creatingStoryInput?.name ?? '',
            priority,
        });
    };

    const handleSaveStoryClick = (storyId: number) => () => {
        const editingStoryInput = editingStoryInputs[storyId];

        if (!editingStoryInput) {
            return;
        }

        props.deps.stateSyncer.updateStory(storyId, editingStoryInput);

        const remainingEditingStoryInputs = { ...editingStoryInputs };
        delete remainingEditingStoryInputs[storyId];
        setEditingStoryInputs(remainingEditingStoryInputs);
    };

    const handleDeleteStoryClick = (storyId: number) => () => {
        props.deps.stateSyncer.deleteStory(storyId);

        const remainingEditingStoryInputs = { ...editingStoryInputs };
        delete remainingEditingStoryInputs[storyId];
        setEditingStoryInputs(remainingEditingStoryInputs);
    };

    const storyPriorityChangedHandler =
        (story: Story) => (priority: Priority) => {
            props.deps.stateSyncer.updateStory(story.id, {
                name: story.name,
                ownerId: story.owner?.id,
                status: story.status,
                priority,
            });
        };

    const storyNameChangedHandler =
        (story: Story) => (event: ChangeEvent<HTMLInputElement>) => {
            const storyName = event.target.value;

            setEditingStoryInputs({
                ...editingStoryInputs,
                [story.id]: {
                    name: storyName,
                    status: story.status,
                    priority: story.priority,
                    ownerId: story.owner?.id,
                },
            });
        };

    const handleSelectStoryOwner = (story: Story) => (ownerId?: number) => {
        props.deps.stateSyncer.updateStory(story.id, {
            name: story.name,
            ownerId,
            status: story.status,
            priority: story.priority,
        });
    };

    return (
        <table className={styles.StoryTable}>
            <thead className={styles.TableHeader}>
                <tr>
                    <th></th>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody className={styles.TableBody}>
                {props.creatingNewStory && (
                    <tr className={styles.TableRow}>
                        <td></td>
                        <td></td>
                        <td>
                            <input
                                className={styles.TextField}
                                value={creatingStoryInput?.name}
                                onChange={onCreatingStoryNameChange}
                            />
                        </td>
                        <td>
                            <StoryPriority
                                relativeLayout={props.deps.relativeLayout}
                                priority={creatingStoryInput?.priority}
                                onPriorityChange={onCreatingStoryPriorityChange}
                            />
                        </td>
                        <td>
                            <StoryStatus status={'TODO'} />
                        </td>
                        <td className={styles.Actions}>
                            <div className={styles.Action}>
                                <SelectOwnersPopupComponent
                                    deps={props.deps}
                                    onSelectOwner={onSelectCreatingStoryOwner}
                                    selectedOwner={
                                        creatingStoryInput?.ownerId
                                            ? props.deps.graphSource.user(
                                                  creatingStoryInput?.ownerId,
                                              )
                                            : undefined
                                    }
                                />
                            </div>
                            <TooltipUI
                                message='Save'
                                relativeLayout={props.deps.relativeLayout}
                            >
                                <div
                                    className={`${styles.Action} ${styles.Save}`}
                                    onClick={onSaveCreatingStoryClick}
                                >
                                    <MaterialIconUI>save</MaterialIconUI>
                                </div>
                            </TooltipUI>
                            <TooltipUI
                                message='Delete'
                                relativeLayout={props.deps.relativeLayout}
                            >
                                <div
                                    className={`${styles.Action} ${styles.Cancel}`}
                                    onClick={onCancelCreatingStoryClick}
                                >
                                    <MaterialIconUI>close</MaterialIconUI>
                                </div>
                            </TooltipUI>
                        </td>
                    </tr>
                )}
                {props.stories.map((story) => (
                    <tr key={story.id} className={styles.TableRow}>
                        <td>
                            <input
                                type='checkbox'
                                className={styles.Checkbox}
                                checked={props.selectedStoryIds.has(story.id.toString())}
                                onChange={onSelectStoryChecked(story.id)}
                            />
                        </td>
                        <td>{story.id}</td>
                        <td>
                            <input
                                className={styles.TextField}
                                value={
                                    editingStoryInputs[story.id]?.name ??
                                    story.name
                                }
                                onChange={storyNameChangedHandler(story)}
                            />
                        </td>
                        <td>
                            <StoryPriority
                                relativeLayout={props.deps.relativeLayout}
                                priority={story.priority}
                                onPriorityChange={storyPriorityChangedHandler(
                                    story,
                                )}
                            />
                        </td>
                        <td>
                            <StoryStatus status={story.status} />
                        </td>
                        <td className={styles.Actions}>
                            <div className={styles.Action}>
                                <SelectOwnersPopupComponent
                                    deps={props.deps}
                                    onSelectOwner={handleSelectStoryOwner(
                                        story,
                                    )}
                                    selectedOwner={story.owner}
                                />
                            </div>
                            <TooltipUI
                                message='Save'
                                relativeLayout={props.deps.relativeLayout}
                            >
                                <div
                                    className={`${styles.Action} ${styles.Save}`}
                                    onClick={handleSaveStoryClick(story.id)}
                                >
                                    <MaterialIconUI>save</MaterialIconUI>
                                </div>
                            </TooltipUI>
                            <TooltipUI
                                message='Delete'
                                relativeLayout={props.deps.relativeLayout}
                            >
                                <div
                                    className={`${styles.Action} ${styles.Cancel}`}
                                    onClick={handleDeleteStoryClick(story.id)}
                                >
                                    <MaterialIconUI>close</MaterialIconUI>
                                </div>
                            </TooltipUI>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
