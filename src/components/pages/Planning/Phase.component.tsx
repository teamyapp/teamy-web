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
import { Team } from '@core/entity/team';

interface Props {
    deps: Deps;
    projectId: number;
    phaseId: number;
}

export function PhaseComponent(props: Props) {
    const [project, setProject] = useState<Project>();
    const [phase, setPhase] = useState<Phase>();
    const [currentTeam, setCurrentTeam] = useState<Team>();
    const [onEditingNewStoryInBacklog, setOnEditingNewStoryInBacklog] =
        useState(false);
    const [onEditingNewStoryInPhase, setOnEditingNewStoryInPhase] =
        useState(false);
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
        const stateChangeChan = props.deps.localStore.subscribeStateChange();

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
    
        (async () => {
            while (true) {
                console.log('[PhaseComponent] waiting for state changes');
                const hasChanged = await stateChangeChan!.pop();
                if (hasChanged === undefined) {
                    // check undefined instead of falsy because
                    // a falsy data could be valid data per channel's concern.
                    return;
                }

                const project = props.deps.graphSource.project(props.projectId);
                if (project) {
                    setProject(project);
                }

                const currentTeam = props.deps.graphSource.currentTeam();
                if (currentTeam) {
                    setCurrentTeam(currentTeam);
                }

                const phase = props.deps.graphSource.phase(props.phaseId);
                if (phase) {
                    setPhase(phase);
                }
            }
        })().then();

    }, []);

    const onBacklogStorySelect = (storyIdNumber: number) => {
        backlogStorySelectorRef.current.selectItem(storyIdNumber.toString());
    };

    const onPhaseStorySelect = (storyIdNumber: number) => {
        phaseStorySelectorRef.current.selectItem(storyIdNumber.toString());
    };

    const onStoryDetailClickHandler = (storyId: number) => {
        if (!currentTeam) {
            return;
        }

        props.deps.router.navigateTo(
            phaseStoryPath(
                currentTeam.id,
                props.projectId,
                props.phaseId,
                storyId,
            ),
        );
    };

    const onStoryDoubleClickHandler = (storyId: number) => {
        return (event: MouseEvent<HTMLDivElement>) => {
            event.stopPropagation();
            if (!currentTeam) {
                return;
            }

            props.deps.router.navigateTo(
                phaseStoryPath(
                    currentTeam.id,
                    props.projectId,
                    props.phaseId,
                    storyId,
                ),
            );
        };
    };

    const onAddStoryInPhaseClick = () => {
        setOnEditingNewStoryInPhase(true);
    };

    const onDeletePhaseStoriesClick = () => {
        selectedPhaseStoryIds.forEach((storyId) => {
            props.deps.stateSyncer.deleteStory(parseInt(storyId));
        });

        phaseStorySelectorRef.current.reset();
    };

    const onRemoveStoriesToPhaseClick = () => {
        props.deps.stateSyncer.removeStoriesFromPhase(
            props.phaseId,
            Array.from(selectedPhaseStoryIds.values()).map((id) =>
                parseInt(id),
            ),
        );

        phaseStorySelectorRef.current.reset();
    }

    const onAddStoryInBacklogClick = () => {
        setOnEditingNewStoryInBacklog(true);
    };

    const onCreateStoryInPhase = async (story: CreateStoryInput) => {
        const storyId = await props.deps.stateSyncer.createStory(
            props.projectId,
            story,
        );
        props.deps.stateSyncer.addStoryToPhase(props.phaseId, storyId);
        setOnEditingNewStoryInPhase(false);
    };

    const onCreateStoryInBacklog = (story: CreateStoryInput) => {
        props.deps.stateSyncer.createStory(props.projectId, story);
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
            props.phaseId,
            Array.from(selectedBacklogStoryIds.values()).map((id) =>
                parseInt(id),
            ),
        );

        backlogStorySelectorRef.current.reset();
    };

    const onDeleteBacklogStoriesClick = () => {
        selectedBacklogStoryIds.forEach((storyId) => {
            props.deps.stateSyncer.deleteStory(parseInt(storyId));
        });

        backlogStorySelectorRef.current.reset();
    };

    if (!currentTeam || !project || !phase) {
        return null;
    }

    return (
        <div className={styles.Phase}>
            <div className={styles.PhaseDetail}>
                <div className={styles.Header}>
                    <div className={styles.Information}>
                        {phase.name}
                        <div className={styles.Description}>
                            {phase.deliveredStories} of{' '}
                            {phase.totalStories} stories delivered
                        </div>
                    </div>
                    <div className={styles.Actions}>
                        {selectedPhaseStoryIds.size > 0 && (
                            <>
                                <div
                                    className={`${styles.Action} ${styles.Remove}`}
                                    onClick={onRemoveStoriesToPhaseClick}
                                >
                                    <MaterialIconUI>read_more</MaterialIconUI>
                                </div>

                                <div
                                    className={`${styles.Action} ${styles.Delete}`}
                                    onClick={onDeletePhaseStoriesClick}
                                >
                                    <MaterialIconUI>close</MaterialIconUI>
                                </div>
                            </>
                        )}
                        <div
                            className={`${styles.Action} ${styles.Add}`}
                            onClick={onAddStoryInPhaseClick}
                        >
                            <MaterialIconUI>add</MaterialIconUI>
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
                    {phase.stories.map((story) => (
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
                    {project.unplannedStories.map((story) => (
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
