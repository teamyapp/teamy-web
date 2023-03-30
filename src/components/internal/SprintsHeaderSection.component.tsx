import classNames from 'classnames';
import React, { Component, ReactNode } from 'react';

import * as csp from '@lib/csp/csp';
import { closeIfNot } from '@lib/csp/lib';
import { Router } from '@lib/router/router';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TooltipUI } from '@lib/ui/Tooltip';

import { orderByStartTimeDesc } from '@core/data/sprint.order';
import { unfinished } from '@core/data/task.filter';
import { Deps } from '@core/dep/deps';
import { Sprint } from '@core/entity/sprint';
import { GraphSource } from '@core/storage/graph/graphSource';
import { LocalStore } from '@core/storage/syncer/localStore';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';
import { getEndAt } from './format';

import { ConfirmActionsModalComponent } from './Modals/ConfirmActionsModal.component';
import styles from './SprintsHeaderSection.component.module.scss';
import { getSprintName } from './format';

interface Props {
    deps: Deps;
    onCreateSprintClick?: () => void;
}

interface State {
    currentSprint?: Sprint;
    showDetail: boolean;
    sprints: Sprint[];
}

export class SprintsHeaderSectionComponent extends Component<Props, State> {
    private readonly localStore: LocalStore;
    private readonly graphSource: GraphSource;
    private readonly stateSyncer: StateSyncer;
    private readonly confirmModalRef: React.RefObject<ConfirmActionsModalComponent> =
        React.createRef();
    private stateChangeChan?: csp.PopChannel<boolean | undefined>;

    constructor(props: Props) {
        super(props);
        this.graphSource = props.deps.graphSource;
        this.localStore = props.deps.localStore;
        this.stateSyncer = props.deps.stateSyncer;
        this.state = {
            sprints: [],
            showDetail: false,
        };
    }

    render() {
        return (
            <div className={styles.SprintHeaderSectionContainer}>
                <TooltipUI
                    message={'Move Unfinished Tasks To Next Sprint'}
                    position={'Bottom'}
                >
                    <div className={styles.MoveSection}>
                        <div
                            className={styles.Button}
                            onClick={this.onCopyUnfinishedTasksClick}
                        >
                            <MaterialIconUI>outbound</MaterialIconUI>
                        </div>
                    </div>
                </TooltipUI>

                <div
                    className={styles.SprintHeaderSection}
                    tabIndex={-1}
                    onBlur={this.onBlur}
                >
                    <div className={styles.SectionContainer}>
                        <div
                            className={`${styles.HeaderSection} ${classNames({
                                [styles.Active]: this.state.showDetail,
                            })}`}
                            onClick={this.onHeaderSectionClick}
                        >
                            <div className={styles.Icon}>
                                <MaterialIconUI>directions_run</MaterialIconUI>
                            </div>
                            {
                                <div className={styles.Name}>
                                    {this.renderSprintName()}
                                </div>
                            }
                        </div>
                        {this.state.showDetail && (
                            <div className={styles.Detail}>
                                <div className={styles.AddSection}>
                                    <div
                                        className={styles.Button}
                                        onClick={this.props.onCreateSprintClick}
                                    >
                                        <MaterialIconUI>add</MaterialIconUI>
                                    </div>
                                </div>
                                {this.state.sprints.length > 0 && (
                                    <div className={styles.Divider} />
                                )}
                                <div className={styles.Sprints}>
                                    {this.state.sprints.map(this.renderSprint)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <ConfirmActionsModalComponent
                    ref={this.confirmModalRef}
                    message='Do you want to copy unfinished tasks to the next sprint?'
                    onConfirm={this.copyUnfinishedTasksToNextSprint}
                />
            </div>
        );
    }

    renderSprint = (sprint: Sprint): ReactNode => {
        return (
            <div
                key={sprint.id}
                className={styles.Sprint}
                onClick={this.onSprintClick(sprint.id)}
            >
                {sprint.id === this.state.currentSprint?.id && (
                    <div className={styles.Selected} />
                )}
                <div>{getSprintName(sprint.startAt)}</div>
                <div
                    className={styles.Delete}
                    onClick={this.onDeleteSprintClick(sprint.id)}
                >
                    <MaterialIconUI>close</MaterialIconUI>
                </div>
            </div>
        );
    };

    renderSprintName() {
        if (this.state.currentSprint) {
            return getSprintName(this.state.currentSprint.startAt);
        }

        return 'Select Sprint';
    }

    componentDidMount() {
        this.stateChangeChan = this.localStore.subscribeStateChange();
        (async () => {
            while (true) {
                console.log(
                    '[SprintsHeaderSectionComponent] waiting for state changes',
                );
                const hasChanged = await this.stateChangeChan!.pop();
                if (hasChanged === undefined) {
                    // check undefined instead of falsy because
                    // a falsy data could be valid data per channel's concern.
                    return;
                }

                this.updateState();
            }
        })().then();
    }

    componentWillUnmount() {
        closeIfNot(this.stateChangeChan);
    }

    private updateState = () => {
        const currentSprint = this.graphSource.currentSprint();
        let sprints: Sprint[] = this.graphSource.currentTeam()?.sprints || [];
        sprints = orderByStartTimeDesc(sprints);
        this.setState({
            currentSprint,
            sprints,
        });
    };

    private onHeaderSectionClick = () => {
        this.setState({
            showDetail: !this.state.showDetail,
        });
    };

    private onCopyUnfinishedTasksClick = () => {
        this.confirmModalRef.current?.open();
    };

    private canCopyTasksToNextSprint = () => {
        const currentSprint = this.graphSource.currentSprint();
        if (!currentSprint) {
            return false;
        }

        const unfinishedTasks = (currentSprint.tasks || []).filter(unfinished);

        if (!unfinishedTasks.length) {
            return false;
        }

        return true;
    };

    private copyUnfinishedTasksToNextSprint = async () => {
        if (!this.canCopyTasksToNextSprint()) {
            alert('can not copy tasks to next sprint');
            return;
        }

        const currentSprint = this.graphSource.currentSprint()!;
        let nextSprintId = this.getNextSprint(currentSprint)?.id;
        if (!nextSprintId) {
            const startAt = new Date();
            const endAt = getEndAt(startAt, '1week');

            nextSprintId = await this.stateSyncer.createSprint(
                this.graphSource.currentTeam()!.id, 
                {
                    startAt,
                    endAt,
                },
            );
        }
        
        const unfinishedTasks = (currentSprint.tasks || []).filter(unfinished);
        const unfinishedTaskIds = unfinishedTasks.map((task) => task.id);
        this.stateSyncer.copyTasksToSprint(nextSprintId, unfinishedTaskIds);
    };

    private getNextSprint(currentSprint: Sprint) {
        let sprints = [...this.state.sprints];
        sprints = orderByStartTimeDesc(sprints);
        const currentIndex = sprints.findIndex(
            (sprint) => sprint.id === currentSprint.id,
        );

        if (currentIndex === 0) {
            return null;
        }

        return sprints[currentIndex - 1];
    }

    private onSprintClick = (sprintId: number) => {
        return async () => {
            if (this.stateSyncer.trySetCurrentSprint(sprintId)) {
                this.stateSyncer.pullCurrentSprint();
            }

            this.setState({
                showDetail: false,
            });
        };
    };

    private onDeleteSprintClick = (sprintId: number) => {
        return () => {
            this.stateSyncer.deleteSprint(sprintId);
        };
    };

    private onBlur = () => {
        this.setState({
            showDetail: false,
        });
    };
}
