import moment from 'moment';
import { Component } from 'react';

import { DataPoint, Range } from '@lib/chart/data';
import { DataLine, LineChart } from '@lib/chart/line.chart';
import * as csp from '@lib/csp/csp';
import { closeIfNot } from '@lib/csp/lib';
import { Duration } from '@lib/time/duration';

import { Deps } from '@core/dep/deps';
import { Sprint } from '@core/entity/sprint';
import { GraphSource } from '@core/storage/graph/graphSource';
import { LocalStore } from '@core/storage/syncer/localStore';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import styles from './ProductivityOverviewDashboard.component.module.scss';

interface Props {
    deps: Deps;
    startTime: Date;
    endTime: Date;
}

interface State {
    sprints: Sprint[];
}

export class ProductivityOverviewDashboardComponent extends Component<
    Props,
    State
> {
    private readonly localStore: LocalStore;
    private readonly graphSource: GraphSource;
    private readonly stateSyncer: StateSyncer;

    private stateChangeChan?: csp.PopChannel<boolean | undefined>;
    private activeTeamId?: number;

    constructor(props: Props) {
        super(props);
        this.localStore = props.deps.localStore;
        this.graphSource = props.deps.graphSource;
        this.stateSyncer = props.deps.stateSyncer;
        this.state = {
            sprints: [],
        };
    }

    async componentDidMount() {
        this.stateChangeChan = this.localStore.subscribeStateChange();
        (async () => {
            while (true) {
                console.log(
                    '[ProductivityOverviewDashboardComponent] waiting for state changes',
                );
                const hasChanged = await this.stateChangeChan!.pop();
                if (hasChanged === undefined) {
                    // check undefined instead of falsy because
                    // a falsy data could be valid data per channel's concern.
                    return;
                }

                await this.updateState();
            }
        })().then();
    }

    componentWillUnmount() {
        closeIfNot(this.stateChangeChan);
    }

    render() {
        const xRange: Range = {
            start: this.props.startTime.getTime(),
            end: this.props.endTime.getTime(),
        };

        const week = Duration.fromJson({ weeks: 1 });
        const gridXGap = week.totalMilliSeconds;
        const sprints = this.querySprints();
        const sprintTotalEffortLine = getSprintTotalEffortLine(sprints);
        const deliveredEffortLine = getDeliveredEffortLine(sprints);
        const assignedEffortLine = getAssignedEffortLine(sprints);
        const lines: DataLine[] = [
            sprintTotalEffortLine,
            deliveredEffortLine,
            assignedEffortLine,
        ];
        // TODO: Auto zoom in graph between minY and maxY
        // const minY = getMinY(lines);
        const maxY = getMaxY(lines);
        const xLabels = this.getXLabels();
        const xLabelStartDate = this.getXLabelStartDate().valueOf();
        const yRange: Range = {
            start: 0,
            end: maxY || 0,
        };
        const yLabelGap = Duration.fromJson({ hours: 10 }).totalMilliSeconds;
        const yGridGap = Duration.fromJson({ hours: 5 }).totalMilliSeconds;
        const yLabels = getYLabels(yRange, yLabelGap);
        return (
            <div className={styles.Dashboard}>
                <div className={styles.Title}>Productivity Overview</div>
                <div className={styles.Chart}>
                    <LineChart
                        lines={lines}
                        xRange={xRange}
                        xLineOffset={xLabelStartDate}
                        xLabelOffset={xLabelStartDate}
                        xLabels={xLabels}
                        xLabelGap={gridXGap}
                        xLabelTitle={'Start Of Week'}
                        yRange={yRange}
                        yLineOffset={0}
                        yLabelOffset={0}
                        yLabels={yLabels}
                        yLabelGap={yLabelGap}
                        yLabelTitle={'Effort(Hours)'}
                        yLabelMaxWidth={60}
                        gridHeight={340}
                        gridXGap={gridXGap}
                        gridYGap={yGridGap}
                        gridYMarginRight={30}
                    />
                </div>
            </div>
        );
    }

    async updateState() {
        const appState = this.localStore.getState();
        if (
            appState.fetchedTeamData &&
            appState.currTeamId !== this.activeTeamId
        ) {
            this.activeTeamId = appState.currTeamId;
            const sprints = this.graphSource.currentTeam()?.sprints || [];
            this.setState({
                sprints,
            });
            await Promise.all(
                sprints.map((sprint) => this.stateSyncer.pullSprint(sprint.id)),
            );
        }
    }

    getXLabels(): string[] {
        const xLabels: string[] = [];
        const startDate = this.getXLabelStartDate();
        let currentDate = startDate.clone();
        while (!currentDate.isAfter(this.props.endTime)) {
            xLabels.push(currentDate.format('MM/DD/YY'));
            currentDate = currentDate.add('1', 'week');
        }

        return xLabels;
    }

    getXLabelStartDate() {
        const startTimeMo = moment(this.props.startTime);
        const startDate = startTimeMo.clone().startOf('isoWeek');
        if (startDate.isBefore(startTimeMo)) {
            return startDate.add(1, 'week');
        }

        return startDate;
    }

    querySprints(): Sprint[] {
        const startTime = this.props.startTime.getTime();
        const endTime = this.props.endTime.getTime();
        return this.state.sprints
            .filter((sprint: Sprint) => {
                const sprintStartAt = sprint.startAt.getTime();
                return sprintStartAt >= startTime && sprintStartAt <= endTime;
            })
            .sort(
                (sprintA, sprintB) =>
                    sprintA.startAt.getTime() - sprintB.startAt.getTime(),
            );
    }
}

function getYLabels(rangeY: Range, yLabelGap: number): string[] {
    const yLabels: string[] = [];
    for (let num = rangeY.start; num <= rangeY.end; num += yLabelGap) {
        yLabels.push(`${moment.duration(num).asHours()}`);
    }

    return yLabels;
}

function getDeliveredEffortLine(sprints: Sprint[]): DataLine {
    const dataPoints: DataPoint[] = sprints.map((sprint) => {
        const deliveredEffort = sprint.tasks
            .filter(
                (task) =>
                    task.status === 'DELIVERED' && task.effort !== undefined,
            )
            .map((task) => task.effort!.totalMilliSeconds)
            .reduce(
                (prevValue: number, currValue: number, currIndex: number) =>
                    prevValue + currValue,
                0,
            );
        return {
            x: sprint.startAt.getTime(),
            y: deliveredEffort,
        };
    });
    return {
        name: 'Delivered',
        color: 'green',
        dataPoints: dataPoints,
    };
}

function getSprintTotalEffortLine(sprints: Sprint[]): DataLine {
    const dataPoints: DataPoint[] = sprints.map((sprint) => {
        const deliveredEffort = sprint.tasks
            .filter((task) => task.effort !== undefined)
            .map((task) => task.effort!.totalMilliSeconds)
            .reduce(
                (prevValue: number, currValue: number, currIndex: number) =>
                    prevValue + currValue,
                0,
            );
        return {
            x: sprint.startAt.getTime(),
            y: deliveredEffort,
        };
    });
    return {
        name: 'Sprint total',
        color: '#ffa000',
        dataPoints: dataPoints,
    };
}

function getAssignedEffortLine(sprints: Sprint[]): DataLine {
    const dataPoints: DataPoint[] = sprints.map((sprint) => {
        const deliveredEffort = sprint.tasks
            .filter((task) => task.owner && task.effort !== undefined)
            .map((task) => task.effort!.totalMilliSeconds)
            .reduce(
                (prevValue: number, currValue: number, currIndex: number) =>
                    prevValue + currValue,
                0,
            );
        return {
            x: sprint.startAt.getTime(),
            y: deliveredEffort,
        };
    });
    return {
        name: 'Assigned',
        color: '#c2185b',
        dataPoints: dataPoints,
    };
}

// function getMinY(dataLines: DataLine[]): number | undefined {
//     return getExtremeValue(dataLines, Math.min);
// }

function getMaxY(dataLines: DataLine[]): number | undefined {
    return getExtremeValue(dataLines, Math.max);
}

function getExtremeValue(
    dataLines: DataLine[],
    combineValue: (...values: number[]) => number,
): number | undefined {
    if (!dataLines) {
        return;
    }

    const yValues: number[] = [];
    for (const dataLine of dataLines) {
        for (const dataPoint of dataLine.dataPoints) {
            yValues.push(dataPoint.y);
        }
    }

    if (yValues.length === 0) {
        return;
    }

    return combineValue(...yValues);
}
