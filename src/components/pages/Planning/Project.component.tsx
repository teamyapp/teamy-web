import classNames from 'classnames';
import moment from 'moment';
import { ReactElement, createRef, useState } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { Deps } from '@core/dep/deps';
import { CreateStoryInput } from '@core/entity/input';
import { Phase } from '@core/entity/phase';
import { Project } from '@core/entity/project';
import { phasePath, standaloneStoryPath } from '@core/routing/routes';

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
    const [onEditingNewStoryInBacklog, setOnEditingNewStoryInBacklog] =
        useState(false);
    const timelineRef = createRef<TimelineComponentHandle>();
    const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number>();
    const currentTeam = props.deps.graphSource.currentTeam();
    if (!currentTeam) {
        return null;
    }

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
                    [styles.Selected]: index === selectedPhaseIndex,
                })}`}
                onDoubleClick={onDoubleClickPhaseHandler(phase.id)}
                onClick={onClickPhaseHandler(index)}
            >
                <div className={styles.Name}>{phase.name}</div>
                <div className={styles.Status}>
                    {phase.deliveredStories} of {phase.totalStories} stories
                    delivered
                </div>
                <div className={styles.Duration}>
                    {moment(phase.expectedStartAt).format('MMM DD')} -{' '}
                    {moment(phase.expectedEndAt).format('MMM DD')}
                </div>
            </div>
        );
    };
    const onClickStoryDetailHandler = async (storyId: number) => {
        await props.deps.stateSyncer.pullCurrentTeamTaskPreview({
            isPlanned: false,
        });
        props.deps.router.navigateTo(
            standaloneStoryPath(currentTeam.id, props.project.id, storyId),
        );
    };

    const onClickPhaseHandler = (phaseIndex: number) => {
        return () => {
            timelineRef.current?.showAndSelectItem(phaseIndex, 0);
            setSelectedPhaseIndex(phaseIndex);
        };
    };

    const onDoubleClickPhaseHandler = (phaseId: number) => {
        return () => {
            props.deps.router.navigateTo(
                phasePath(currentTeam.id, props.project.id, phaseId),
            );
        };
    };

    const timelineItemSelect = (rowIndex: number, itemIndex: number) => {
        setSelectedPhaseIndex(rowIndex);
    };

    const onAddStoryInBacklogClick = () => {
        setOnEditingNewStoryInBacklog(true);
    };

    const onCreateStoryInBacklog = (story: CreateStoryInput) => {
        // props.deps.stateSyncer.createStory(
        //     props.deps.localStore.getState().currTeamId!,
        //     story,
        // );
        setOnEditingNewStoryInBacklog(false);
    };

    const onDiscardNewStoryInBacklog = () => {
        setOnEditingNewStoryInBacklog(false);
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
                        onItemSelect={timelineItemSelect}
                    />
                </div>
            </div>

            <div className={styles.StoryListSection}>
                <div className={styles.TopBar}>
                    <div className={styles.Title}>Stories</div>
                    <div
                        className={styles.Add}
                        onClick={onAddStoryInBacklogClick}
                    >
                        <MaterialIconUI>add</MaterialIconUI>
                    </div>
                </div>
                <div className={styles.StoryList}>
                    {onEditingNewStoryInBacklog && (
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
                                onClickStoryDetailHandler={
                                    onClickStoryDetailHandler
                                }
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
