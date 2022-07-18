import classNames from 'classnames';
import moment from 'moment';
import React, { Component, ReactNode } from 'react';

import * as csp from '@lib/csp/csp';
import { Router } from '@lib/router/router';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { orderByStartTimeDesc } from '@core/data/sprint.order';
import { Deps } from '@core/dep/deps';
import { Sprint } from '@core/entity/sprint';
import { GraphSource } from '@core/storage/graph/graphSource';
import { LocalStore } from '@core/storage/syncer/localStore';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import styles from './SprintsHeaderSection.component.module.scss';

interface Props {
    deps: Deps;
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
    private readonly router: Router;
    private stateChangeChan?: csp.PopChannel<boolean | undefined>;

    constructor(props: Props) {
        super(props);
        this.graphSource = props.deps.graphSource;
        this.localStore = props.deps.localStore;
        this.stateSyncer = props.deps.stateSyncer;
        this.router = props.deps.router;
        this.state = {
            sprints: [],
            showDetail: false,
        };
    }

    render() {
        return (
            <div className={styles.SprintHeaderSection}>
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
                            {this.state.currentSprint
                                ? getSprintName(
                                      this.state.currentSprint.startAt,
                                  )
                                : 'Select Sprint'}
                        </div>
                    }
                </div>
                {this.state.showDetail && (
                    <div className={styles.Detail}>
                        <div className={styles.AddButton}>
                            <MaterialIconUI>add</MaterialIconUI>
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
            </div>
        );
    };

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
        this.stateChangeChan?.close();
    }

    private updateState = () => {
        const currentSprint = this.graphSource.currentSprint();
        let sprints = this.graphSource.currentTeam()?.sprints || [];
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

    private onSprintClick = (sprintId: number) => {
        return () => {
            this.stateSyncer.trySetCurrentSprint(sprintId);
            this.setState({
                showDetail: false,
            });
        };
    };
}

function getSprintName(startAt: Date): string {
    return moment(startAt).format('YYYY-MM-DD');
}
