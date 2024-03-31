import { MouseEvent, useEffect, useRef, useState } from 'react';

import { ItemsSelector } from '@lib/collections/itemSelector';
import { getPlatform } from '@lib/runtime/os';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { Deps } from '@core/dep/deps';
import { CreateStoryInput } from '@core/entity/input';
import { Phase } from '@core/entity/phase';
import { Project } from '@core/entity/project';
import { phaseStoryPath } from '@core/routing/routes';

import { InlineCreateStory } from './InlineCreateStory.component';
import styles from './Phase.component.module.scss';
import { StoryInlineItemComponent } from './StoryInlineItem.component';

interface Props {
    deps: Deps;
    project: Project;
    phase: Phase;
}

export function PhaseComponent(props: Props) {
    const [onEditingNewStoryInBacklog, setOnEditingNewStoryInBacklog] =
        useState(false);
    const [onEditingNewStoryInPhase, setOnEditingNewStoryInPhase] =
        useState(false);
    const currentTeam = props.deps.graphSource.currentTeam();
    const [selectedBacklogStoryIds, setSelectedBacklogStoryIds] = useState<
        Set<string>
    >(new Set());
    const [selectedPhaseStoryIds, setSelectedPhaseStoryIds] = useState<
        Set<string>
    >(new Set());
    const selectedBacklogStoryIdsRef = useRef(selectedBacklogStoryIds);
    const selectedPhaseStoryIdsRef = useRef(selectedPhaseStoryIds);

    const ctrlKeyPressedRef = useRef(false);
    const backlogStorySelectorRef = useRef<ItemsSelector>(
        new ItemsSelector(ctrlKeyPressedRef.current, selectedBacklogStoryIds),
    );
    const phaseStorySelectorRef = useRef<ItemsSelector>(
        new ItemsSelector(ctrlKeyPressedRef.current, selectedPhaseStoryIds),
    );

    useEffect(() => {
        const selectedBacklogStoryChan =
            backlogStorySelectorRef.current.subscribeSelectedItemsChanged();
        const selectedPhaseStoryChan =
            phaseStorySelectorRef.current.subscribeSelectedItemsChanged();
        const keyBoardEventChan = props.deps.keyBoardEventMonitor.subscribe();

        (async () => {
            while (true) {
                const selectedBacklogStoryIds =
                    await selectedBacklogStoryChan.pop();
                if (selectedBacklogStoryIds === undefined) {
                    return;
                }

                if (
                    selectedBacklogStoryIds.size > 0 &&
                    selectedPhaseStoryIdsRef.current.size > 0
                ) {
                    await phaseStorySelectorRef.current.reset();
                }

                const updatedSelectedPhases = new Set(selectedBacklogStoryIds);
                setSelectedBacklogStoryIds(updatedSelectedPhases);
                selectedBacklogStoryIdsRef.current = updatedSelectedPhases;
            }
        })();

        (async () => {
            while (true) {
                const selectedPhaseStoryIds =
                    await selectedPhaseStoryChan.pop();
                if (selectedPhaseStoryIds === undefined) {
                    return;
                }

                if (
                    selectedPhaseStoryIds.size > 0 &&
                    selectedBacklogStoryIdsRef.current.size > 0
                ) {
                    await backlogStorySelectorRef.current.reset();
                }

                const updatedSelectedPhases = new Set(selectedPhaseStoryIds);
                setSelectedPhaseStoryIds(updatedSelectedPhases);
                selectedPhaseStoryIdsRef.current = updatedSelectedPhases;
            }
        })();

        (async () => {
            while (true) {
                console.log(`[ProjectComponent] waiting for keyboard event`);
                const keyboardEvent = await keyBoardEventChan.pop();
                if (keyboardEvent === undefined) {
                    return;
                }

                const { key, eventType } = keyboardEvent;
                const platform = getPlatform();
                if (
                    (platform === 'Mac' && key === 'Meta') ||
                    (platform === 'Windows' && key === 'Control')
                ) {
                    if (['keydown', 'keyup'].includes(eventType)) {
                        const isKeyPressed = eventType === 'keydown';
                        ctrlKeyPressedRef.current = isKeyPressed;
                        backlogStorySelectorRef.current.setMultiSelectionEnabled(
                            isKeyPressed,
                        );

                        phaseStorySelectorRef.current.setMultiSelectionEnabled(
                            isKeyPressed,
                        );
                    }
                }
            }
        })();
    }, []);

    const onBacklogStorySelect = (storyIdNumber: number) => {
        backlogStorySelectorRef.current.selectItem(storyIdNumber.toString());
    };

    const onPhaseStorySelect = (storyIdNumber: number) => {
        phaseStorySelectorRef.current.selectItem(storyIdNumber.toString());
    };

    const onStoryDetailClickHandler = (storyId: number) => {
        props.deps.router.navigateTo(
            phaseStoryPath(
                currentTeam!.id,
                props.project.id,
                props.phase.id,
                storyId,
            ),
        );
    };

    const onStoryDoubleClickHandler = (storyId: number) => {
        return (event: MouseEvent<HTMLDivElement>) => {
            event.stopPropagation();
            props.deps.router.navigateTo(
                phaseStoryPath(
                    currentTeam!.id,
                    props.project.id,
                    props.phase.id,
                    storyId,
                ),
            );
        };
    };

    const onAddStoryInPhaseClick = () => {
        setOnEditingNewStoryInPhase(true);
    };

    const onDeleteStoryFromPhaseClick = () => {};

    const onAddStoryInBacklogClick = () => {
        setOnEditingNewStoryInBacklog(true);
    };

    const onCreateStoryInPhase = async (story: CreateStoryInput) => {
        const storyId = await props.deps.stateSyncer.createStory(
            props.project.id,
            story,
        );
        props.deps.stateSyncer.addStoryToPhase(props.phase.id, storyId);
        setOnEditingNewStoryInPhase(false);
    };

    const onCreateStoryInBacklog = (story: CreateStoryInput) => {
        props.deps.stateSyncer.createStory(props.project.id, story);
        setOnEditingNewStoryInBacklog(false);
    };

    const onDiscardNewStoryInPhase = () => {
        setOnEditingNewStoryInPhase(false);
    };

    const onDiscardNewStoryInBacklog = () => {
        setOnEditingNewStoryInBacklog(false);
    };

    const onAddStoriesToPhaseClick = () => {
        props.deps.stateSyncer.addStoriesToPhase(
            props.phase.id,
            Array.from(selectedBacklogStoryIds.values()).map((id) => parseInt(id)),
        );

        backlogStorySelectorRef.current.reset();
    }

    const onDeleteBacklogStoriesClick = () => {
        selectedBacklogStoryIds.forEach((storyId) => {
            props.deps.stateSyncer.deleteStory(parseInt(storyId));
        });

        backlogStorySelectorRef.current.reset();
    };

    if (!currentTeam) {
        return null;
    }

    return (
        <div className={styles.Phase}>
            <div className={styles.PhaseDetail}>
                <div className={styles.Header}>
                    <div className={styles.Information}>
                        {props.phase.name}
                        <div className={styles.Description}>
                            {props.phase.deliveredStories} of{' '}
                            {props.phase.totalStories} stories delivered
                        </div>
                    </div>
                    <div className={styles.Actions}>
                        <div
                            className={`${styles.Action} ${styles.Add}`}
                            onClick={onAddStoryInPhaseClick}
                        >
                            <MaterialIconUI>add</MaterialIconUI>
                        </div>
                        <div
                            className={`${styles.Action} ${styles.Delete}`}
                            onClick={onDeleteStoryFromPhaseClick}
                        >
                            <MaterialIconUI>close</MaterialIconUI>
                        </div>
                    </div>
                </div>
                <div className={styles.StoriesSection}>
                    {onEditingNewStoryInPhase && (
                        <InlineCreateStory
                            deps={props.deps}
                            numActionColumns={1}
                            onCreateStory={onCreateStoryInPhase}
                            onDiscardNewStory={onDiscardNewStoryInPhase}
                        />
                    )}
                    {props.phase.stories.map((story) => (
                        <div
                            className={styles.InlineStory}
                            key={story.id}
                            onDoubleClick={onStoryDoubleClickHandler(story.id)}
                        >
                            <StoryInlineItemComponent
                                story={story}
                                deps={props.deps}
                                isSelected={selectedPhaseStoryIds.has(
                                    story.id.toString(),
                                )}
                                onStoryDetailClickHandler={
                                    onStoryDetailClickHandler
                                }
                                onStorySelectHandler={onPhaseStorySelect}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.StoryListSection}>
                <div className={styles.TopBar}>
                    <div className={styles.Title}>Stories</div>
                    <div className={styles.Actions}>
                        {selectedBacklogStoryIds.size > 0 && (
                            <div
                                className={`${styles.Action} ${styles.Move}`}
                                onClick={onAddStoriesToPhaseClick}
                            >
                                <MaterialIconUI>read_more</MaterialIconUI>
                            </div>
                        )}
                        {selectedBacklogStoryIds.size > 0 && (
                            <div
                                className={`${styles.Action} ${styles.Delete}`}
                                onClick={onDeleteBacklogStoriesClick}
                            >
                                <MaterialIconUI>close</MaterialIconUI>
                            </div>
                        )}
                        <div
                            className={`${styles.Action} ${styles.Add}`}
                            onClick={onAddStoryInBacklogClick}
                        >
                            <MaterialIconUI>add</MaterialIconUI>
                        </div>
                    </div>
                </div>
                <div className={styles.StoryList}>
                    {onEditingNewStoryInBacklog && (
                        <InlineCreateStory
                            deps={props.deps}
                            numActionColumns={1}
                            onCreateStory={onCreateStoryInBacklog}
                            onDiscardNewStory={onDiscardNewStoryInBacklog}
                        />
                    )}
                    {props.project.unplannedStories.map((story) => (
                        <div
                            key={story.id}
                            className={styles.ListItem}
                            onDoubleClick={onStoryDoubleClickHandler(story.id)}
                        >
                            <StoryInlineItemComponent
                                story={story}
                                deps={props.deps}
                                isSelected={selectedBacklogStoryIds.has(
                                    story.id.toString(),
                                )}
                                onStoryDetailClickHandler={
                                    onStoryDetailClickHandler
                                }
                                onStorySelectHandler={onBacklogStorySelect}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
