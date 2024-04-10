import classNames from 'classnames';
import React, {
    ChangeEvent,
    Component,
    MouseEvent,
    ReactNode,
} from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TooltipUI } from '@lib/ui/Tooltip';

import { taskGoalLengthLimit } from '@core/config/config';
import { Deps } from '@core/dep/deps';
import { CreateTaskInput } from '@core/entity/input';
import { GraphSource } from '@core/storage/graph/graphSource';

import styles from './InlineCreateTask.module.scss';
import { SelectOwnersPopupComponent } from './SelectOwnersPopupComponent';
import { UserProfileUI } from './UserProfile';
import { getUserShortName } from './format';

interface Props {
    deps: Deps;
    initialTaskOwnerId?: number;
    numActionColumns?: number;
    onCreateTask?: (task: CreateTaskInput) => void;
    onDiscardNewTask?: () => void;
}

interface State {
    task: CreateTaskInput;
}

export class InlineCreateTaskUI extends Component<Props, State> {
    private readonly graphSource: GraphSource;

    constructor(props: Props) {
        super(props);
        this.graphSource = props.deps.graphSource;
        this.state = {
            task: {
                goal: '',
                ownerUserId: props.initialTaskOwnerId,
            },
        };
    }

    public render() {
        return (
            <>
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
                    <div
                        className={styles.ActionsSection}
                        style={{
                            gridTemplateColumns: `repeat(${
                                this.props.numActionColumns || 3
                            }, 1fr)`,
                        }}
                    >
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
                                    onClick={this.onCancelEditTaskClick}
                                >
                                    <div className={styles.CancelEditTaskIcon}>
                                        <MaterialIconUI>close</MaterialIconUI>
                                    </div>
                                </div>
                            </TooltipUI>
                        </div>
                        <SelectOwnersPopupComponent
                            deps={this.props.deps}
                            onSelectOwner={this.onSelectTaskOwner}
                            selectedOwnerId={this.state.task.ownerUserId}
                            assignOwner={this.renderAssignOwner}
                        />
                    </div>
                </div>
            </>
        );
    }

    private renderAssignOwner = ({
        toggleContainer,
        showFollower,
    }: {
        toggleContainer: () => void;
        showFollower: boolean;
    }): ReactNode => {
        const owner = this.owner();
        const name = owner
            ? getUserShortName(owner.firstName, owner.lastName)
            : 'Unassigned';
        return (
            <div className={styles.AssignOwner}>
                <TooltipUI message={name}>
                    <div
                        className={`${styles.Action} ${classNames({
                            [styles.Active]: showFollower,
                        })}`}
                        onClick={toggleContainer}
                    >
                        <div className={` ${styles.AssignOwnerIcon}`}>
                            {this.state.task.ownerUserId ? (
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
        const taskOwnerId = this.state.task.ownerUserId;
        if (!taskOwnerId) {
            return undefined;
        }

        return this.graphSource.user(taskOwnerId);
    };

    private onGoalChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({
            task: Object.assign({}, this.state.task, {
                goal: event.target.value,
            }),
        });
    };

    private onSelectTaskOwner = (ownerUserId?: number) => {
        this.setState({
            task: {
                ...this.state.task,
                ownerUserId,
            },
        });
    };

    private onSaveTaskClick = () => {
        if (this.state.task.goal) {
            this.props.onCreateTask?.call(null, this.state.task);
        } else {
            this.props.onDiscardNewTask?.call(null);
        }
    };

    private onCancelEditTaskClick = () => {
        this.props.onDiscardNewTask?.call(null);
    };
}
