import classNames from 'classnames';
import moment from 'moment';
import {
    MouseEvent,
    ReactElement,
    createRef,
    useEffect,
    useRef,
    useState,
} from 'react';
import { ItemsSelector } from '@lib/collections/itemSelector';
import { getPlatform } from '@lib/runtime/os';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { Deps } from '@core/dep/deps';
import { CreateStoryInput } from '@core/entity/input';
import { Phase } from '@core/entity/phase';
import { Project } from '@core/entity/project';
import { phasePath, projectStoryPath } from '@core/routing/routes';

import { InlineCreateStory } from './InlineCreateStory.component';
import styles from './Project.component.module.scss';
import { StoryInlineItemComponent } from './StoryInlineItem.component';
import {
    Row,
    TimelineComponent,
    TimelineComponentHandle,
} from './Timeline.component';

interface Props {
    deps: Deps;
    project: Project;
}

const startAt = moment().subtract(1, 'months').toDate();
const endAt = moment().add(1, 'months').toDate();

export function ProjectComponent(props: Props) {
    const [isEditingNewStoryInBacklog, setIsEditingNewStoryInBacklog] =
        useState(false);
    const timelineRef = useRef<TimelineComponentHandle>(null);
    const currentTeam = props.deps.graphSource.currentTeam();

    const [selectedStoryIds, setSelectedStoryIds] = useState<Set<string>>(
        new Set(),
    );
    const [selectedPhaseIndexes, setSelectedPhaseIndexes] = useState<
        Set<string>
    >(new Set());

    const selectedStoryIdsRef = useRef(selectedStoryIds);
    const selectedPhaseIndexesRef = useRef(selectedPhaseIndexes);

    const ctrlKeyPressedRef = useRef(false);
    const storySelectorRef = useRef<ItemsSelector>(
        new ItemsSelector(ctrlKeyPressedRef.current, selectedStoryIds),
    );
    const phaseSelectorRef = useRef<ItemsSelector>(
        new ItemsSelector(ctrlKeyPressedRef.current, selectedPhaseIndexes),
    );

    useEffect(() => {
        const selectedStoriesChan =
            storySelectorRef.current.subscribeSelectedItemsChanged();
        const selectedPhasesChan =
            phaseSelectorRef.current.subscribeSelectedItemsChanged();
        const keyBoardEventChan = props.deps.keyBoardEventMonitor.subscribe();

        (async () => {
            while (true) {
                const selectedStories = await selectedStoriesChan.pop();
                if (selectedStories === undefined) {
                    return;
                }

                if (
                    selectedStories.size > 0 &&
                    selectedPhaseIndexesRef.current.size > 1
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
                setSelectedPhaseIndexes(updatedSelectedPhases);
                selectedPhaseIndexesRef.current = updatedSelectedPhases;
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

        return () => {
            storySelectorRef.current.dispose();
            phaseSelectorRef.current.dispose();
            keyBoardEventChan.close();
        };
    }, []);

    if (!currentTeam) {
        return null;
    }

    const onStorySelectHandler = (storyIdNumber: number) => {
        storySelectorRef.current.selectItem(storyIdNumber.toString());
    };

    const onPhaseSelectHandler =
        (phaseIndexNumber: number) => async (event: MouseEvent) => {
            event.stopPropagation();
            const isSelected = await phaseSelectorRef.current.selectItem(
                phaseIndexNumber.toString(),
            );

            if (isSelected) {
                timelineRef.current?.showAndSelectItem(phaseIndexNumber, 0);
            } else {
                timelineRef.current?.deselectItem(phaseIndexNumber, 0);
            }
        };

    const rows: Row[] = props.project.phases.map((phase, index) => {
        const ref = createRef<HTMLDivElement>();
        return {
            height: 70,
            items: [
                {
                    ref,
                    view: (
                        <div className={styles.Phase} ref={ref}>
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

    const renderPhase = (phase: Phase, index: number): ReactElement => {
        return (
            <div
                key={index}
                className={`${styles.Phase} ${classNames({
                    [styles.Selected]: selectedPhaseIndexes.has(
                        index.toString(),
                    ),
                })}`}
                onDoubleClick={onPhaseDoubleClickHandler(phase.id)}
                onClick={onPhaseSelectHandler(index)}
            >
                <div className={styles.Name}>{phase.name}</div>
                <div className={styles.Status}>
                    {phase.deliveredStories} of {phase.totalStories} stories
                    delivered
                </div>
                <div className={styles.Duration}>
                    {moment(phase.expectedStartAt).format('MMM DD')}
                    &nbsp;-&nbsp;
                    {moment(phase.expectedEndAt).format('MMM DD')}
                </div>
            </div>
        );
    };
    const onStoryDetailClickHandler = async (storyId: number) => {
        props.deps.router.navigateTo(
            projectStoryPath(currentTeam.id, props.project.id, storyId),
        );
    };

    const onPhaseDoubleClickHandler = (phaseId: number) => {
        return (event: MouseEvent) => {
            event.stopPropagation();
            props.deps.router.navigateTo(
                phasePath(currentTeam.id, props.project.id, phaseId),
            );
        };
    };

    const onTimelineItemSelect = (rowIndex: number, itemIndex: number) => {
        phaseSelectorRef.current.selectItem(rowIndex.toString());
    };

    const onAddStoryInBacklogClick = () => {
        setIsEditingNewStoryInBacklog(true);
    };

    const onCreateStoryInBacklog = (story: CreateStoryInput) => {
        setIsEditingNewStoryInBacklog(false);
    };

    const onDiscardNewStoryInBacklog = () => {
        setIsEditingNewStoryInBacklog(false);
    };

    return (
        <div className={styles.Project}>
            <div className={styles.ProjectView}>
                <div className={styles.PhaseListSection}>
                    <div className={styles.TopBar}>
                        <div className={styles.Title}>Phases</div>
                        <div className={styles.Add}>
                            <MaterialIconUI>add</MaterialIconUI>
                        </div>
                    </div>
                    <div className={styles.PhaseList}>
                        {props.project.phases.map(renderPhase)}
                    </div>
                </div>
                <div className={styles.Timeline}>
                    <TimelineComponent
                        ref={timelineRef}
                        startAt={startAt}
                        endAt={endAt}
                        rows={rows}
                        onItemSelect={onTimelineItemSelect}
                    />
                </div>
            </div>

            <div className={styles.StoryListSection}>
                <div className={styles.TopBar}>
                    <div className={styles.Title}>Stories</div>
                    <div className={styles.Actions}>
                        {selectedStoryIds.size > 0 &&
                            selectedPhaseIndexes.size > 0 && (
                                <div className={styles.Move}>
                                    <MaterialIconUI>
                                        arrow_right_alt
                                    </MaterialIconUI>
                                </div>
                            )}
                        {selectedStoryIds.size > 0 && (
                            <div className={styles.Delete}>
                                <MaterialIconUI>delete</MaterialIconUI>
                            </div>
                        )}
                        <div
                            className={styles.Add}
                            onClick={onAddStoryInBacklogClick}
                        >
                            <MaterialIconUI>add</MaterialIconUI>
                        </div>
                    </div>
                </div>
                <div className={styles.StoryList}>
                    {isEditingNewStoryInBacklog && (
                        <InlineCreateStory
                            deps={props.deps}
                            onCreateStory={onCreateStoryInBacklog}
                            onDiscardNewStory={onDiscardNewStoryInBacklog}
                        />
                    )}
                    {props.project.stories.map((story) => (
                        <div className={styles.ListItem} key={story.id}>
                            <StoryInlineItemComponent
                                story={story}
                                key={story.id}
                                deps={props.deps}
                                isSelected={selectedStoryIds.has(
                                    story.id.toString(),
                                )}
                                onStorySelectHandler={onStorySelectHandler}
                                onClickStoryDetailHandler={
                                    onStoryDetailClickHandler
                                }
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
