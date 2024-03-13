import classNames from 'classnames';
import moment from 'moment';
import { ReactElement, createRef, useState } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import styles from './Planning.component.module.scss';
import {
    Row,
    TimelineComponent,
    TimelineComponentHandle,
} from './Timeline.component';

type PhaseStatus = 'TODO' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';
type StoryStatus = 'TODO' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';
type Priority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

interface Phase {
    id: number;
    name: string;
    status: PhaseStatus;
    expectedStartAt: Date;
    actualStartAt?: Date;
    expectedEndAt: Date;
    actualEndAt?: Date;
    creatorID: number;
    totalStories: number;
    deliveredStories: number;
    createdAt: Date;
    updatedAt?: Date;
}

interface Project {
    id: number;
    name: string;
    expectedStartAt?: Date;
    actualStartAt?: Date;
    expectedEndAt?: Date;
    actualEndAt?: Date;
    creatorID: number;
    createdAt: Date;
    updatedAt?: Date;
}

interface Story {
    id: number;
    name: string;
    ownerID: number;
    status: StoryStatus;
    priority?: Priority;
    creatorID: number;
    createdAt: Date;
    updatedAt?: Date;
}

const phases: Phase[] = [
    {
        id: 1,
        name: 'Discovery',
        status: 'TODO',
        expectedStartAt: moment('2024-03-01', 'YYYY-MM-DD').toDate(),
        expectedEndAt: moment('2024-03-20', 'YYYY-MM-DD').toDate(),
        creatorID: 1,
        totalStories: 50,
        deliveredStories: 6,
        createdAt: new Date(),
    },
    {
        id: 2,
        name: 'Define & Hypothesize',
        status: 'TODO',
        expectedStartAt: moment('2024-03-07', 'YYYY-MM-DD').toDate(),
        expectedEndAt: moment('2024-03-18', 'YYYY-MM-DD').toDate(),
        creatorID: 1,
        totalStories: 60,
        deliveredStories: 10,
        createdAt: new Date(),
    },
    {
        id: 3,
        name: 'Prototyping',
        status: 'TODO',
        expectedStartAt: moment('2024-03-15', 'YYYY-MM-DD').toDate(),
        expectedEndAt: moment('2024-03-20', 'YYYY-MM-DD').toDate(),
        creatorID: 1,
        totalStories: 70,
        deliveredStories: 15,
        createdAt: new Date(),
    },
    {
        id: 4,
        name: 'Visual Design',
        status: 'TODO',
        expectedStartAt: moment('2024-03-04', 'YYYY-MM-DD').toDate(),
        expectedEndAt: moment('2024-03-08', 'YYYY-MM-DD').toDate(),
        creatorID: 1,
        totalStories: 80,
        deliveredStories: 20,
        createdAt: new Date(),
    },
    {
        id: 5,
        name: 'Development',
        status: 'TODO',
        expectedStartAt: moment('2024-03-12', 'YYYY-MM-DD').toDate(),
        expectedEndAt: moment('2024-03-15', 'YYYY-MM-DD').toDate(),
        creatorID: 1,
        totalStories: 90,
        deliveredStories: 25,
        createdAt: new Date(),
    },
    {
        id: 6,
        name: 'Launch',
        status: 'TODO',
        expectedStartAt: moment('2024-03-18', 'YYYY-MM-DD').toDate(),
        expectedEndAt: moment('2024-03-22', 'YYYY-MM-DD').toDate(),
        creatorID: 1,
        totalStories: 100,
        deliveredStories: 30,
        createdAt: new Date(),
    },
];

interface Level {
    name: string;
    onClick: () => void;
}

const startAt = moment('2023-11-19 00:00:00', 'YYYY-MM-DD hh:mm:ss').toDate();
const endAt = moment('2025-04-01 00:00:00', 'YYYY-MM-DD hh:mm:ss').toDate();
const location: Level[] = [
    {
        name: 'Projects',
        onClick: () => {
            console.log('Projects');
        },
    },
    {
        name: 'Project',
        onClick: () => {
            console.log('Project Name');
        },
    },
];

export function PlanningComponent() {
    const timelineRef = createRef<TimelineComponentHandle>();
    const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number>();

    const rows: Row[] = phases.map((phase, index) => {
        const ref = createRef<HTMLDivElement>();
        return {
            height: 70,
            items: [
                {
                    ref,
                    view: (
                        <div key={index} className={styles.Phase} ref={ref}>
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

    const onClickPhaseHandler = (phaseIndex: number) => {
        return () => {
            timelineRef.current?.showAndSelectItem(phaseIndex, 0);
            setSelectedPhaseIndex(phaseIndex);
        };
    };

    const timelineItemSelect = (rowIndex: number, itemIndex: number) => {
        setSelectedPhaseIndex(rowIndex);
    };

    return (
        <div className={styles.Planning}>
            <div className={styles.Location}>
                {location.map((level, index) => {
                    return (
                        <>
                            {index > 0 && (
                                <div
                                    key={`seperator-${index}`}
                                    className={styles.Separator}
                                />
                            )}
                            <div
                                key={`level-${index}`}
                                className={styles.Level}
                                onClick={level.onClick}
                            >
                                {level.name}
                            </div>
                        </>
                    );
                })}
            </div>
            <div className={styles.ProjectView}>
                <div className={styles.PhaseListSection}>
                    <div className={styles.TopBar}>
                        <div className={styles.Title}>Phases</div>
                        <div className={styles.Add}>
                            <MaterialIconUI>add</MaterialIconUI>
                        </div>
                    </div>
                    <div className={styles.PhaseList}>
                        {phases.map(renderPhase)}
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
        </div>
    );
}
