import classNames from 'classnames';
import moment from 'moment';
import React, { MouseEvent, ReactElement, useEffect, useRef, useState } from 'react';

import { ItemsSelector } from '@lib/collections/itemSelector';
import { getPlatform } from '@lib/runtime/os';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { Deps } from '@core/dep/deps';
import { CreateStoryInput, UpdatePhaseInput } from '@core/entity/input';
import { Phase } from '@core/entity/phase';
import { Project } from '@core/entity/project';
import { Team } from '@core/entity/team';
import { phasePath, projectStoryPath } from '@core/routing/routes';
import { ContextMenuComponent } from '../../internal/ContextMenu.component';

import {
    CreatePhaseModalComponent,
    CreatePhaseModalComponentHandle,
} from './CreatePhaseModal.component';
import { InlineCreateStory } from './InlineCreateStory.component';
import styles from './Project.component.module.scss';
import { StoryInlineItemComponent } from './StoryInlineItem.component';
import {
    Row,
    TimelineComponent,
    TimelineComponentHandle,
} from './Timeline.component';
import {
    UpdatePhaseModalComponent,
    UpdatePhaseModalComponentHandle,
} from './UpdatePhaseModal.component';
import { TooltipUI } from '@lib/ui/Tooltip';
import { ButtonUI } from '@lib/ui/Button';

interface Props {
    deps: Deps;
    projectId: number;
}

interface EditingPhaseInput {
    phaseId: number;
    updatePhaseInput: UpdatePhaseInput;
}

const startAt = moment().subtract(1, 'months').toDate();
const endAt = moment().add(1, 'months').toDate();

export function ProjectComponent(props: Props) {
    const [project, setProject] = useState<Project>();
    const [showRightPanel, setShowRightPanel] = useState(false);
    const [currentTeam, setCurrentTeam] = useState<Team>();
    const [isEditingNewStoryInBacklog, setIsEditingNewStoryInBacklog] =
        useState(false);
    const createPhaseModalComponentRef =
        useRef<CreatePhaseModalComponentHandle>(null);
    const updatePhaseModalComponentRef =
        useRef<UpdatePhaseModalComponentHandle>(null);
    const [editingPhaseInput, setEditingPhaseInput] = useState<EditingPhaseInput>();
    const timelineRef = useRef<TimelineComponentHandle>(null);

    const [selectedStoryIds, setSelectedStoryIds] = useState<Set<string>>(
        new Set(),
    );
    const [selectedPhaseIds, setSelectedPhaseIds] = useState<Set<string>>(
        new Set(),
    );

    const selectedStoryIdsRef = useRef(selectedStoryIds);
    const selectedPhaseIdsRef = useRef(selectedPhaseIds);

    const ctrlKeyPressedRef = useRef(false);
    const storySelectorRef = useRef<ItemsSelector>(
        new ItemsSelector(ctrlKeyPressedRef.current, selectedStoryIds),
    );
    const phaseSelectorRef = useRef<ItemsSelector>(
        new ItemsSelector(ctrlKeyPressedRef.current, selectedPhaseIds),
    );
    const handleUpdatePhase = async (updatePhaseInput: UpdatePhaseInput) => {
        if (!editingPhaseInput) {
            return;
        }

       await props.deps.stateSyncer.updatePhase(
            editingPhaseInput.phaseId,
            updatePhaseInput,
        );
    };

    useEffect(() => {
        const selectedStoriesChan =
            storySelectorRef.current.subscribeSelectedItemsChanged();
        const selectedPhasesChan =
            phaseSelectorRef.current.subscribeSelectedItemsChanged();
        const keyBoardEventChan = props.deps.keyBoardEventMonitor.subscribe();
        const stateChangeChan = props.deps.localStore.subscribeStateChange();

        (async () => {
            while (true) {
                const selectedStories = await selectedStoriesChan.pop();
                if (selectedStories === undefined) {
                    return;
                }

                if (
                    selectedStories.size > 0 &&
                    selectedPhaseIdsRef.current.size > 1
                ) {
                    await phaseSelectorRef.current.reset();
                }

                const updatedSelectedStories = new Set(selectedStories);
                setSelectedStoryIds(updatedSelectedStories);
                selectedStoryIdsRef.current = updatedSelectedStories;
            }
        })();

        (async () => {
            while (true) {
                const selectedPhases = await selectedPhasesChan.pop();
                if (selectedPhases === undefined) {
                    return;
                }

                if (
                    selectedStoryIdsRef.current.size > 0 &&
                    selectedPhases.size > 1
                ) {
                    await storySelectorRef.current.reset();
                }

                const updatedSelectedPhases = new Set(selectedPhases);
                setSelectedPhaseIds(updatedSelectedPhases);
                selectedPhaseIdsRef.current = updatedSelectedPhases;
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
                        storySelectorRef.current.setMultiSelectionEnabled(
                            isKeyPressed,
                        );
                        phaseSelectorRef.current.setMultiSelectionEnabled(
                            isKeyPressed,
                        );
                    }
                }
            }
        })();

        (async () => {
            while (true) {
                console.log('[ProjectComponent] waiting for state changes');
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
            }
        })().then();

        return () => {
            phaseSelectorRef.current.dispose();
            storySelectorRef.current.dispose();
        };
    }, []);

    const rows: Row[] = (project?.phases || []).map((phase, index) => {
        return {
            height: 70,
            items: [
                {
                    view: (
                        <div className={styles.Phase}>
                            <div className={styles.ProgressBar}>
                                <div
                                    className={styles.Progress}
                                    style={{
                                        width: `${
                                            (phase.deliveredStories /
                                                phase.totalStories) *
                                            100
                                        }%`,
                                    }}
                                />
                            </div>
                            <div className={styles.Name}>{phase.name}</div>
                            <div className={styles.Status}>
                                {phase.deliveredStories} of {phase.totalStories}{' '}
                                stories delivered
                            </div>
                        </div>
                    ),
                    startAt: phase.expectedStartAt,
                    endAt: phase.expectedEndAt,
                },
            ],
        };
    });

    const onStorySelectHandler = (storyIdNumber: number) => {
        storySelectorRef.current.selectItem(storyIdNumber.toString());
    };

    const onToggleSelect =
        (phaseIdNumber: number, phaseIndexNumber: number) =>
            async () => {
                const isSelected = await phaseSelectorRef.current.selectItem(
                    phaseIdNumber.toString(),
                );

                if (isSelected) {
                    timelineRef.current?.showAndSelectItem(phaseIndexNumber, 0);
                } else {
                    timelineRef.current?.deselectItem(phaseIndexNumber, 0);
                }
            };

    const onDeletePhaseHandler = (phaseId: number) => () => {
        props.deps.stateSyncer.deletePhase(phaseId);
    };

    const onEditPhaseHandler = (phase: Phase) => () => {
        const editingPhaseInput: EditingPhaseInput =
            {
                phaseId: phase.id,
                updatePhaseInput: {
                    name: phase.name,
                    expectedStartAt: phase.expectedStartAt,
                    expectedEndAt: phase.expectedEndAt,
                    status: phase.status,
                },
            };

        setEditingPhaseInput(editingPhaseInput);
        updatePhaseModalComponentRef.current?.open(editingPhaseInput.updatePhaseInput);
    };

    const onViewPhaseDetailHandler =
        (phaseId: number) => () => {
            if (!currentTeam || !project) {
                return;
            }

            props.deps.router.navigateTo(
                phasePath(currentTeam.id, project.id, phaseId),
            );
        };

    const renderPhase = (phase: Phase, index: number): ReactElement => {
        return (
            <div
                key={index}
                className={`${styles.Phase} ${classNames({
                    [styles.Selected]: selectedPhaseIds.has(
                        phase.id.toString(),
                    ),
                })}`}
            >
                <PhaseRow
                    phase={phase}
                    onToggleSelect={onToggleSelect(phase.id, index)}
                    onEditPhase={onEditPhaseHandler(phase)}
                    onDeletePhase={onDeletePhaseHandler(phase.id)}
                    onViewPhaseDetail={onViewPhaseDetailHandler(phase.id)}
                />
            </div>
        );
    };

    const onStoryDetailClickHandler = (storyId: number) => {
        if (!currentTeam || !project) {
            return;
        }

        props.deps.router.navigateTo(
            projectStoryPath(currentTeam.id, project.id, storyId),
        );
    };

    const onTimelineItemSelect = (rowIndex: number, itemIndex: number) => {
        phaseSelectorRef.current.selectItem(rowIndex.toString());
    };

    const onAddStoryInBacklogClick = () => {
        setIsEditingNewStoryInBacklog(true);
    };

    const onCreateStoryInBacklog = (story: CreateStoryInput) => {
        props.deps.stateSyncer.createStory(props.projectId, story);
        setIsEditingNewStoryInBacklog(false);
    };

    const onDiscardNewStoryInBacklog = () => {
        setIsEditingNewStoryInBacklog(false);
    };

    const onAddPhaseClick = () => {
        createPhaseModalComponentRef.current?.open();
    };

    const onAddStoriesToPhaseClick = () => {
        if (selectedPhaseIds.size !== 1 || selectedStoryIds.size === 0) {
            return;
        }

        props.deps.stateSyncer.addStoriesToPhase(
            parseInt(Array.from(selectedPhaseIds.values())[0]),
            Array.from(selectedStoryIds.values()).map((id) => parseInt(id)),
        );

        storySelectorRef.current.reset();
        phaseSelectorRef.current.reset();
    };

    const onToggleRightPanelClick = () => {
        setShowRightPanel(!showRightPanel);
    };

    const onDeleteStoriesClick = () => {
        if (selectedStoryIds.size === 0) {
            return;
        }

        selectedStoryIds.forEach((storyId) => {
            props.deps.stateSyncer.deleteStory(parseInt(storyId));
        });

        storySelectorRef.current.reset();
    };

    if (!project || !currentTeam) {
        return null;
    }

    return (
        <div className={styles.Project}>
            <div className={styles.ProjectView}>
                <div className={styles.PhaseListSection}>
                    <div className={styles.TopBar}>
                        <div className={styles.Title}>Phases</div>
                        <TooltipUI
                            message="Create phase"
                            relativeLayout={props.deps.relativeLayout}
                        >
                            <div
                                className={styles.Add}
                                onClick={onAddPhaseClick}
                            >
                                <MaterialIconUI>add</MaterialIconUI>
                            </div>
                        </TooltipUI>
                    </div>
                    <div className={styles.PhaseList}>
                        {project.phases.map(renderPhase)}
                    </div>
                </div>
                {project.phases.length === 0 ? (
                    <div className={styles.CreatePhaseContainer}>
                        <ButtonUI
                            onClick={onAddPhaseClick}
                            label="Create phase"
                        />
                    </div>
                ) : (
                    <div className={styles.Timeline}>
                        <TimelineComponent
                            ref={timelineRef}
                            relativeLayout={props.deps.relativeLayout}
                            startAt={startAt}
                            endAt={endAt}
                            rows={rows}
                            onItemSelect={onTimelineItemSelect}
                        />
                    </div>
                )}
            </div>
            <div className={styles.StoryListPanel}>
                <div className={styles.LeftActions}>
                    <div
                        className={`${styles.Action} ${styles.Expand} ${classNames(
                            {
                                [styles.Active]: !showRightPanel,
                            },
                        )}`}
                        onClick={onToggleRightPanelClick}
                    >
                        <MaterialIconUI>
                            {showRightPanel
                                ? 'collapse_content'
                                : 'expand_content'}
                        </MaterialIconUI>
                    </div>
                </div>
                <div
                    className={`${styles.StoryListSection} ${classNames({
                        [styles.Hidden]: !showRightPanel,
                    })}`}
                >
                    <div className={styles.TopBar}>
                        <div className={styles.Title}>Stories</div>
                        <div className={styles.Actions}>
                            {selectedStoryIds.size > 0 &&
                                selectedPhaseIds.size > 0 && (
                                    <TooltipUI
                                        message="Move to phase"
                                        relativeLayout={
                                            props.deps.relativeLayout
                                        }
                                    >
                                        <div
                                            className={`${styles.Action} ${styles.Move}`}
                                            onClick={onAddStoriesToPhaseClick}
                                        >
                                            <MaterialIconUI>
                                                read_more
                                            </MaterialIconUI>
                                        </div>
                                    </TooltipUI>
                                )}
                            {selectedStoryIds.size > 0 && (
                                <TooltipUI
                                    message="Delete"
                                    relativeLayout={props.deps.relativeLayout}
                                >
                                    <div
                                        className={`${styles.Action} ${styles.Delete}`}
                                        onClick={onDeleteStoriesClick}
                                    >
                                        <MaterialIconUI>close</MaterialIconUI>
                                    </div>
                                </TooltipUI>
                            )}
                            <TooltipUI
                                message="Create story"
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
                        {isEditingNewStoryInBacklog && (
                            <InlineCreateStory
                                deps={props.deps}
                                numActionColumns={1}
                                onCreateStory={onCreateStoryInBacklog}
                                onDiscardNewStory={onDiscardNewStoryInBacklog}
                            />
                        )}
                        {project.unplannedStories.map((story) => (
                            <div className={styles.ListItem} key={story.id}>
                                <StoryInlineItemComponent
                                    story={story}
                                    key={story.id}
                                    deps={props.deps}
                                    isSelected={selectedStoryIds.has(
                                        story.id.toString(),
                                    )}
                                    onStorySelectHandler={onStorySelectHandler}
                                    onStoryDetailClickHandler={
                                        onStoryDetailClickHandler
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <CreatePhaseModalComponent
                ref={createPhaseModalComponentRef}
                deps={props.deps}
                projectId={props.projectId}
            />
            <UpdatePhaseModalComponent
                ref={updatePhaseModalComponentRef}
                updatePhase={handleUpdatePhase}
            />
        </div>
    );
}

interface PhaseRowProps {
    phase: Phase;
    onToggleSelect: () => void;
    onEditPhase: () => void;
    onDeletePhase: () => void;
    onViewPhaseDetail: () => void;
}

function PhaseRow(props: PhaseRowProps) {
    const phaseContextMenuRef = useRef<ContextMenuComponent>(null);
    const onContextMenu = (event: MouseEvent) => {
        event.preventDefault();
        phaseContextMenuRef.current?.open(event.clientY, event.clientX);
    }
    return (
        <>
            <div className={styles.PhaseRow}
                onContextMenu={onContextMenu}>
                <div className={styles.Name}>{props.phase.name}</div>
                <div className={styles.Status}>
                    {props.phase.deliveredStories} of {props.phase.totalStories} stories
                    delivered
                </div>
                <div className={styles.Duration}>
                    {moment(props.phase.expectedStartAt).format('MMM DD')}
                    &nbsp;-&nbsp;
                    {moment(props.phase.expectedEndAt).format('MMM DD')}
                </div>
            </div>
            <ContextMenuComponent
                ref={phaseContextMenuRef}
                menuItems={[
                    {
                        key: 'toggleSelect',
                        action: props.onToggleSelect,
                        label: 'Toggle Select',
                    },
                    {
                        key: 'viewDetail',
                        action: props.onViewPhaseDetail,
                        label: 'View Detail',
                    },
                    {
                        key: 'edit',
                        action: props.onEditPhase,
                        label: 'Edit',
                    },
                    {
                        key: 'delete',
                        action: props.onDeletePhase,
                        label: 'Delete',
                    },
                ]}
            />
        </>
    );
}