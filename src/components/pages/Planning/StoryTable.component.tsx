import { Deps } from '@core/dep/deps';
import { CreateStoryInput, UpdateStoryInput } from '@core/entity/input';
import { Story, StoryStatus as Status } from '@core/entity/story';
import { ChangeEvent, FC, useState } from 'react';
import { StoryStatusComponent } from './StoryStatus.component';
import styles from './StoryTable.component.module.scss';
import { StoryPriority } from './StoryPriority.component';
import { Priority } from '@core/entity/priority';
import { SelectOwnersPopupComponent } from 'components/internal/SelectOwnersPopupComponent';
import { TooltipUI } from '@lib/ui/Tooltip';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

interface Props {
    stories: Story[];
    deps: Deps;
    creatingNewStory: boolean;
    cancelCreatingNewStory: () => void;
    saveCreatingNewStory: (story?: CreateStoryInput) => void;
    onStorySelect: (storyId: number) => void;
    selectedStoryIds: Set<string>;
    onStoryDetailsClick: (storyId: number) => void;
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
        if (!creatingStoryInput?.name) {
            return;
        }

        setCreatingStoryInput(undefined);

        props.saveCreatingNewStory(creatingStoryInput);
    };

    const handleStoryDetailClick = (storyId: number) => () => {
        props.onStoryDetailsClick(storyId);
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
            status: creatingStoryInput?.status ?? 'TODO',
        });
    };

    const onSelectCreatingStoryOwner = (ownerId?: number) => {
        setCreatingStoryInput({
            ...creatingStoryInput,
            name: creatingStoryInput?.name ?? '',
            ownerId,
            status: creatingStoryInput?.status ?? 'TODO',
        });
    };

    const onCreatingStoryPriorityChange = (priority: Priority) => {
        setCreatingStoryInput({
            ...creatingStoryInput,
            name: creatingStoryInput?.name ?? '',
            priority,
            status: creatingStoryInput?.status ?? 'TODO',
        });
    };

    const onCreatingStoryStatusChanged = (status: Status) => {
        setCreatingStoryInput({
            ...creatingStoryInput,
            name: creatingStoryInput?.name ?? '',
            status,
        });
    }

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

    const handleStoryStatusChanged = (story: Story) => (status: Status) => {
        props.deps.stateSyncer.updateStory(story.id, {
            name: story.name,
            ownerId: story.owner?.id,
            status,
            priority: story.priority,
        });
    }

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

    const handleStoryNameClicked = (story: Story) => () => {
        setEditingStoryInputs({
            ...editingStoryInputs,
            [story.id]: {
                name: story.name,
                status: story.status,
                priority: story.priority,
                ownerId: story.owner?.id,
            },
        });
    };

    return (
        <table className={styles.StoryTable}>
            <thead className={styles.TableHeader}>
                <tr>
                    <th className={styles.CheckboxCol}></th>
                    <th className={styles.IdCol}>ID</th>
                    <th className={styles.NameCol}>Name</th>
                    <th className={styles.PriorityCol}>Priority</th>
                    <th className={styles.StatusCol}>Status</th>
                    <th className={styles.OwnerCol}>Owner</th>
                    <th className={styles.ActionsCol}>Actions</th>
                </tr>
            </thead>
            <tbody className={styles.TableBody}>
                {props.creatingNewStory && (
                    <tr className={styles.TableRow}>
                        <td></td>
                        <td></td>
                        <td>
                            <div className={styles.CreatingStoryName}>
                                <input
                                    autoFocus
                                    className={styles.TextField}
                                    value={creatingStoryInput?.name}
                                    onChange={onCreatingStoryNameChange}
                                />

                                <div className={styles.Actions}>
                                    <TooltipUI
                                        message='Save'
                                        relativeLayout={
                                            props.deps.relativeLayout
                                        }
                                    >
                                        <div
                                            className={`${styles.Action} ${styles.Save}`}
                                            onClick={onSaveCreatingStoryClick}
                                        >
                                            <MaterialIconUI>
                                                save
                                            </MaterialIconUI>
                                        </div>
                                    </TooltipUI>

                                    <TooltipUI
                                        message='Cancel'
                                        relativeLayout={
                                            props.deps.relativeLayout
                                        }
                                    >
                                        <div
                                            className={`${styles.Action} ${styles.Cancel}`}
                                            onClick={onCancelCreatingStoryClick}
                                        >
                                            <MaterialIconUI>
                                                close
                                            </MaterialIconUI>
                                        </div>
                                    </TooltipUI>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div className={styles.StoryPriority}>
                                <StoryPriority
                                    relativeLayout={props.deps.relativeLayout}
                                    priority={creatingStoryInput?.priority}
                                    onPriorityChange={
                                        onCreatingStoryPriorityChange
                                    }
                                />
                            </div>
                        </td>
                        <td>
                            <div className={styles.StoryStatus}>
                                <StoryStatusComponent
                                    relativeLayout={props.deps.relativeLayout}
                                    status={'TODO'}
                                    onStatusChange={
                                        onCreatingStoryStatusChanged
                                    }
                                />
                            </div>
                        </td>
                        <td className={styles.OwnerCol}>
                            <div className={styles.StoryOwner}>
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
                        </td>
                        <td className={styles.Actions}></td>
                    </tr>
                )}
                {props.stories.map((story) => (
                    <tr
                        key={story.id}
                        className={styles.TableRow}
                        onBlur={handleSaveStoryClick(story.id)}
                    >
                        <td className={styles.CheckboxCol}>
                            <input
                                type='checkbox'
                                className={styles.Checkbox}
                                checked={props.selectedStoryIds.has(
                                    story.id.toString(),
                                )}
                                onChange={onSelectStoryChecked(story.id)}
                            />
                        </td>
                        <td className={styles.IdCol}>{story.id}</td>
                        <td className={styles.NameCol}>
                            {editingStoryInputs[story.id] ? (
                                <input
                                    autoFocus
                                    className={styles.TextField}
                                    value={
                                        editingStoryInputs[story.id]?.name ??
                                        story.name
                                    }
                                    onChange={storyNameChangedHandler(story)}
                                />
                            ) : (
                                <div
                                    onDoubleClick={handleStoryNameClicked(
                                        story,
                                    )}
                                >
                                    {story.name}
                                </div>
                            )}
                        </td>
                        <td>
                            <div className={styles.StoryPriority}>
                                <StoryPriority
                                    relativeLayout={props.deps.relativeLayout}
                                    priority={story.priority}
                                    onPriorityChange={storyPriorityChangedHandler(
                                        story,
                                    )}
                                />
                            </div>
                        </td>
                        <td>
                            <div className={styles.StoryStatus}>
                                <StoryStatusComponent
                                    relativeLayout={props.deps.relativeLayout} 
                                    status={story.status} 
                                    onStatusChange={handleStoryStatusChanged(story)}/>
                            </div>
                        </td>
                        <td className={styles.OwnerCol}>
                            <div className={styles.StoryOwner}>
                                <SelectOwnersPopupComponent
                                    deps={props.deps}
                                    onSelectOwner={handleSelectStoryOwner(
                                        story,
                                    )}
                                    selectedOwner={story.owner}
                                />
                            </div>
                        </td>
                        <td className={styles.Actions}>
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
                            <TooltipUI
                                message='Detail'
                                relativeLayout={props.deps.relativeLayout}
                            >
                                <div
                                    className={`${styles.Action} ${styles.Details}`}
                                    onClick={handleStoryDetailClick(story.id)}
                                >
                                    <MaterialIconUI>settings</MaterialIconUI>
                                </div>
                            </TooltipUI>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
