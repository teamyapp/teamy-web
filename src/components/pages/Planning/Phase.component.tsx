import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import { ItemsSelector } from '@lib/collections/itemSelector';
import { getPlatform } from '@lib/runtime/os';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TooltipUI } from '@lib/ui/Tooltip';
import { Deps } from '@core/dep/deps';
import { CreateStoryInput } from '@core/entity/input';
import { Phase } from '@core/entity/phase';
import { Project } from '@core/entity/project';
import { Team } from '@core/entity/team';
import { phaseStoryPath } from '@core/routing/routes';

import { InlineCreateStory } from './InlineCreateStory.component';
import styles from './Phase.component.module.scss';
import { StoryInlineItemComponent } from './StoryInlineItem.component';
import { DropDownList, Option } from '@lib/ui/DropDownList';
import { StoryTable } from './StoryTable.component';
import { Story } from '@core/entity/story';
import {
    sortByStoryId,
    sortByStoryName,
    sortByStoryPriority,
    sortByStoryStatus,
} from '@core/config/sortOrder';

type itemViewOptionKey = 'TABLE' | 'CARDS';
const viewOptions: Option[] = [
    {
        key: 'TABLE',
        description: 'Table',
    },
    {
        key: 'CARDS',
        description: 'Cards',
    },
];
type sortOptionKey = 'ID' | 'NAME' | 'PRIORITY' | 'STATUS';
const orderOptions: Option[] = [
    {
        key: 'ID',
        description: 'Id',
    },
    {
        key: 'NAME',
        description: 'Name',
    },
    {
        key: 'PRIORITY',
        description: 'Priority',
    },
    {
        key: 'STATUS',
        description: 'Status',
    },
];

interface Props {
    deps: Deps;
    projectId: number;
    phaseId: number;
}

export function PhaseComponent(props: Props) {
    const [project, setProject] = useState<Project>();
    const [phase, setPhase] = useState<Phase>();
    const [onEditingPhase, setOnEditingPhase] = useState(false);
    const [currentTeam, setCurrentTeam] = useState<Team>();
    const [selectedOrder, setSelectedOrder] = useState<sortOptionKey>('ID');
    const [selectedView, setSelectedView] =
        useState<itemViewOptionKey>('TABLE');
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
    const [phaseName, setPhaseName] = useState<string>(phase?.name || '');

    const ctrlKeyPressedRef = useRef(false);
    const backlogStorySelectorRef = useRef<ItemsSelector>(
        new ItemsSelector(ctrlKeyPressedRef.current, selectedBacklogStoryIds),
    );
    const phaseStorySelectorRef = useRef<ItemsSelector>(
        new ItemsSelector(ctrlKeyPressedRef.current, selectedPhaseStoryIds),
    );
    const [sortedPhaseStories, setSortedPhaseStories] = useState<Story[]>(
        phase?.stories || [],
    );

    phaseStorySelectorRef.current.setMultiSelectionEnabled(
        selectedView === 'TABLE',
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
                    setPhaseName(phase.name);
                    setSortPhaseStories(phase.stories, selectedOrder);
                }
            }
        })().then();

        return () => {
            phaseStorySelectorRef.current.dispose();
            backlogStorySelectorRef.current.dispose();
        };
    }, []);

    const onPhaseNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPhaseName(event.target.value);
    };

    const onPhaseNameDoubleClicked = () => {
        setOnEditingPhase(true);
    };

    const onEditPhaseName = () => {
        setOnEditingPhase(true);
    };

    const saveEditedPhaseName = async () => {
        if (!phase || !phaseName) {
            return;
        }

        await props.deps.stateSyncer.updatePhase(phase.id, {
            name: phaseName,
            expectedStartAt: phase.expectedStartAt,
            expectedEndAt: phase.expectedEndAt,
            status: phase.status,
        });
        setOnEditingPhase(false);
    };

    const cancelEditedPhaseName = () => {
        setPhaseName(phase?.name || '');
        setOnEditingPhase(false);
    };

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

    const onCreateStoryInPhaseClick = () => {
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
    };

    const onAddStoryInBacklogClick = () => {
        setOnEditingNewStoryInBacklog(true);
    };

    const onCreateStoryInPhase = async (story?: CreateStoryInput) => {
        setOnEditingNewStoryInPhase(false);
        if (!story) {
            return;
        }

        const storyId = await props.deps.stateSyncer.createStory(
            props.projectId,
            story,
        );
        props.deps.stateSyncer.addStoryToPhase(props.phaseId, storyId);
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

    const onSelectView = (key: string) => {
        setSelectedView(key as itemViewOptionKey);
    };

    const setSortPhaseStories = (
        stories: Story[],
        selectedOrder: sortOptionKey,
    ) => {
        const sortedPhaseStories = [...stories];

        switch (selectedOrder) {
            case 'ID':
                sortedPhaseStories.sort(sortByStoryId);
                break;
            case 'NAME':
                sortedPhaseStories.sort(sortByStoryName);
                break;
            case 'PRIORITY':
                sortedPhaseStories.sort(sortByStoryPriority);
                break;
            case 'STATUS':
                sortedPhaseStories.sort(sortByStoryStatus);
                break;
        }

        setSortedPhaseStories(sortedPhaseStories);
    };

    const onSelectedSortOrder = (key: string) => {
        setSelectedOrder(key as sortOptionKey);
        setSortPhaseStories(phase?.stories || [], key as sortOptionKey);
    };

    if (!currentTeam || !project || !phase) {
        return null;
    }

    return (
        <div className={styles.Phase}>
            <div className={styles.PhaseDetail}>
                <div className={styles.HeaderSection}>
                    <div className={styles.Header}>
                        <div className={styles.Information}>
                            {onEditingPhase ? (
                                <input
                                    className={styles.TextField}
                                    value={phaseName}
                                    onChange={onPhaseNameChange}
                                />
                            ) : (
                                <div className={styles.PhaseName} onDoubleClick={onPhaseNameDoubleClicked}>
                                    {phase.name}
                                </div>
                            )}
                            <div className={styles.Description}>
                                {phase.deliveredStories} of {phase.totalStories}{' '}
                                stories delivered
                            </div>
                        </div>
                        <div className={styles.Actions}>
                            {onEditingPhase && (
                                <>
                                    <TooltipUI
                                        message='Save'
                                        relativeLayout={
                                            props.deps.relativeLayout
                                        }
                                    >
                                        <div
                                            className={`${styles.Action} ${styles.Save}`}
                                            onClick={saveEditedPhaseName}
                                        >
                                            <MaterialIconUI>
                                                check
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
                                            onClick={cancelEditedPhaseName}
                                        >
                                            <MaterialIconUI>
                                                cancel
                                            </MaterialIconUI>
                                        </div>
                                    </TooltipUI>
                                </>
                            )}
                        </div>
                    </div>
                    <div className={styles.Operations}>
                        <div className={styles.LeftSection}>
                            <TooltipUI
                                message='View mode'
                                relativeLayout={props.deps.relativeLayout}
                            >
                                <div className={styles.Selections}>
                                    <DropDownList
                                        relativeLayout={
                                            props.deps.relativeLayout
                                        }
                                        selectOptionKey={selectedView}
                                        options={viewOptions}
                                        onSelectOption={onSelectView}
                                    />
                                </div>
                            </TooltipUI>
                            <TooltipUI
                                message='Order by'
                                relativeLayout={props.deps.relativeLayout}
                            >
                                <div className={styles.Selections}>
                                    <DropDownList
                                        relativeLayout={
                                            props.deps.relativeLayout
                                        }
                                        selectOptionKey={selectedOrder}
                                        options={orderOptions}
                                        onSelectOption={onSelectedSortOrder}
                                    />
                                </div>
                            </TooltipUI>
                        </div>
                        <div className={styles.RightSection}>
                            {selectedPhaseStoryIds.size > 0 && (
                                <>
                                    <TooltipUI
                                        message='Remove from phase'
                                        relativeLayout={
                                            props.deps.relativeLayout
                                        }
                                    >
                                        <div
                                            className={`${styles.Action} ${styles.Remove}`}
                                            onClick={
                                                onRemoveStoriesToPhaseClick
                                            }
                                        >
                                            <MaterialIconUI>
                                                read_more
                                            </MaterialIconUI>
                                        </div>
                                    </TooltipUI>
                                    <TooltipUI
                                        message='Delete'
                                        relativeLayout={
                                            props.deps.relativeLayout
                                        }
                                    >
                                        <div
                                            className={`${styles.Action} ${styles.Delete}`}
                                            onClick={onDeletePhaseStoriesClick}
                                        >
                                            <MaterialIconUI>
                                                close
                                            </MaterialIconUI>
                                        </div>
                                    </TooltipUI>
                                </>
                            )}
                            <TooltipUI
                                message='Create story'
                                relativeLayout={props.deps.relativeLayout}
                            >
                                <div
                                    className={`${styles.Action} ${styles.Add}`}
                                    onClick={onCreateStoryInPhaseClick}
                                >
                                    <MaterialIconUI>add</MaterialIconUI>
                                </div>
                            </TooltipUI>
                        </div>
                    </div>
                </div>
                <div className={styles.StoriesSection}>
                    {selectedView === 'CARDS' ? (
                        <>
                            {onEditingNewStoryInPhase && (
                                <InlineCreateStory
                                    deps={props.deps}
                                    numActionColumns={1}
                                    onCreateStory={onCreateStoryInPhase}
                                    onDiscardNewStory={onDiscardNewStoryInPhase}
                                />
                            )}
                            {sortedPhaseStories.map((story) => (
                                <div
                                    className={styles.InlineStory}
                                    key={story.id}
                                    onDoubleClick={onStoryDoubleClickHandler(
                                        story.id,
                                    )}
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
                                        onStorySelectHandler={
                                            onPhaseStorySelect
                                        }
                                    />
                                </div>
                            ))}
                        </>
                    ) : (
                        <StoryTable
                            saveCreatingNewStory={onCreateStoryInPhase}
                            cancelCreatingNewStory={() =>
                                setOnEditingNewStoryInPhase(false)
                            }
                            stories={sortedPhaseStories}
                            deps={props.deps}
                            selectedStoryIds={selectedPhaseStoryIds}
                            onStorySelect={onPhaseStorySelect}
                            creatingNewStory={onEditingNewStoryInPhase}
                            onStoryDetailsClick={onStoryDetailClickHandler}
                        />
                    )}
                </div>
            </div>

            <div className={styles.StoryListSection}>
                <div className={styles.TopBar}>
                    <div className={styles.Title}>Stories</div>
                    <div className={styles.Actions}>
                        {selectedBacklogStoryIds.size > 0 && (
                            <TooltipUI
                                message='Move to phase'
                                relativeLayout={props.deps.relativeLayout}
                            >
                                <div
                                    className={`${styles.Action} ${styles.Move}`}
                                    onClick={onAddStoriesToPhaseClick}
                                >
                                    <MaterialIconUI>read_more</MaterialIconUI>
                                </div>
                            </TooltipUI>
                        )}
                        {selectedBacklogStoryIds.size > 0 && (
                            <TooltipUI
                                message='Delete'
                                relativeLayout={props.deps.relativeLayout}
                            >
                                <div
                                    className={`${styles.Action} ${styles.Delete}`}
                                    onClick={onDeleteBacklogStoriesClick}
                                >
                                    <MaterialIconUI>close</MaterialIconUI>
                                </div>
                            </TooltipUI>
                        )}
                        <TooltipUI
                            message='Create story'
                            relativeLayout={props.deps.relativeLayout}
                        >
                            <div
                                className={`${styles.Action} ${styles.Add}`}
                                onClick={onAddStoryInBacklogClick}
                            >
                                <MaterialIconUI>add</MaterialIconUI>
                            </div>
                        </TooltipUI>
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
