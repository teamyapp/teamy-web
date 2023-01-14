import classNames from 'classnames';
import React, { ChangeEvent, Component, MouseEvent, ReactNode } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TooltipUI } from '@lib/ui/Tooltip';
import { BoundingBoxFinder } from '@lib/ui/position';

import { taskGoalLengthLimit } from '@core/config/config';
import { Deps } from '@core/dep/deps';
import { CreateTaskInput } from '@core/entity/input';
import { GraphSource } from '@core/storage/graph/graphSource';

import styles from './InlineCreateTask.module.scss';
import { UserProfileUI } from './UserProfile';
import { getUserShortName } from './format';

interface Props {
    deps: Deps;
    taskOwnerId?: number;
    onCreateTask?: (task: CreateTaskInput) => void;
    onDiscardNewTask?: () => void;
    onShowPotantialTaskOwners?: (
        findAlignTargetBoundBox: BoundingBoxFinder,
        onClose: () => void,
    ) => void;
}

interface State {
    task: CreateTaskInput;
    assigningOwner: boolean;
}

export class InlineCreateTaskUI extends Component<Props, State> {
    private readonly graphSource: GraphSource;
    constructor(props: Props) {
        super(props);
        this.graphSource = props.deps.graphSource;
        this.state = {
            task: {
                goal: '',
                ownerUserId: props.taskOwnerId,
            },
            assignOwnerActive: false,
        };
    }

    public render() {
        return (
            <div className={styles.Task}>
                <div className={styles.LeftSection}>
                    <textarea
                        autoFocus
                        maxLength={taskGoalLengthLimit}
                        className={styles.GoalTextField}
                        value={this.state.task.goal || ''}
                        onChange={this.onGoalChange}
                    />
                </div>
                <div className={styles.ActionsSection}>
                    <div>
                        <TooltipUI message={'Save'}>
                            <div
                                className={styles.Action}
                                onClick={this.onSaveTaskClick}
                            >
                                <div className={styles.SaveTaskIcon}>
                                    <MaterialIconUI>done</MaterialIconUI>
                                </div>
                            </div>
                        </TooltipUI>
                    </div>
                    <div>
                        <TooltipUI message={'Cancel'}>
                            <div
                                className={styles.Action}
                                onClick={this.onCancelTaskClick}
                            >
                                <div className={styles.CancelTaskIcon}>
                                    <MaterialIconUI>close</MaterialIconUI>
                                </div>
                            </div>
                        </TooltipUI>
                    </div>
                    {this.renderAssignOwner()}
                </div>
            </div>
        );
    }

    private renderAssignOwner(): ReactNode {
        const owner = this.owner();
        const name = owner
            ? getUserShortName(owner.firstName, owner.lastName)
            : 'Unassigned';
        return (
            <div className={styles.AssignOwner}>
                <TooltipUI message={name}>
                    <div
                        className={`${styles.Action} ${classNames({
                            [styles.Active]: this.state.assignOwnerActive,
                        })}`}
                        onClick={this.onAssignOwnerClick}
                    >
                        <div className={` ${styles.AssignOwnerIcon}`}>
                            {this.props.taskOwnerId ? (
                                <UserProfileUI user={this.owner()!} />
                            ) : (
                                <MaterialIconUI>face</MaterialIconUI>
                            )}
                        </div>
                    </div>
                </TooltipUI>
            </div>
        );
    }

    private owner = () => {
            return this.graphSource.user(this.props.taskOwnerId);
        }
    };

    private onGoalChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({
            task: Object.assign({}, this.state.task, {
                goal: event.target.value,
            }),
        });
    };

    private onAssignOwnerClick = (event: MouseEvent<HTMLDivElement>) => {
        const element = event.currentTarget as HTMLDivElement;
        this.props.onShowPotantialTaskOwnersToCreateTask?.call(
            this,
            () => {
                return element.getBoundingClientRect();
            },
            () => {
                this.setState({ assignOwnerActive: false });
            },
        );
        this.setState({ assignOwnerActive: true });
    };

    private getUpdatedTask = () => {
        return {
            ...this.state.task,
            ownerUserId: this.props.taskOwnerId,
        };
    };

    private onSaveTaskEditionClick = () => {
        if (this.state.task.goal) {
            this.props.onCreateTask?.call(null, this.getUpdatedTask());
        } else {
            this.props.onDiscardNewTask?.call(null);
        }
    };

    private onCancelTaskEditionClick = () => {
        this.props.onDiscardNewTask?.call(null);
    };
}
