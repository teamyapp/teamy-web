import React, { ChangeEvent, Component } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TooltipUI } from '@lib/ui/Tooltip';

import { taskGoalLengthLimit } from '@core/config/config';
import { Deps } from '@core/dep/deps';
import { CreateTaskInput } from '@core/entity/input';
import { GraphSource } from '@core/storage/graph/graphSource';

import styles from './InlineCreateTask.module.scss';
import { SelectOwnersPopupComponent } from './SelectOwnersPopupComponent';
import { getPlatform } from '@lib/runtime/os';

interface Props {
    deps: Deps;
    initialTaskOwnerId?: number;
    numActionColumns?: number;
    onCreateTask?: (task: CreateTaskInput) => void;
    onDiscardNewTask?: () => void;
}

interface State {
    task: CreateTaskInput;
    isCmdKeyPressed?: boolean;
    isControlKeyPressed?: boolean;
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
                            <TooltipUI
                                message={'Save'}
                                relativeLayout={this.props.deps.relativeLayout}
                            >
                                <div
                                    className={styles.Action}
                                    onClick={this.saveTask}
                                >
                                    <div className={styles.SaveTaskIcon}>
                                        <MaterialIconUI>done</MaterialIconUI>
                                    </div>
                                </div>
                            </TooltipUI>
                        </div>
                        <div>
                            <TooltipUI
                                message={'Cancel'}
                                relativeLayout={this.props.deps.relativeLayout}
                            >
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
                            selectedOwner={this.owner()}
                        />
                    </div>
                </div>
            </>
        );
    }

    public componentDidMount() {
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
    }

    public componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
    }

    private onKeyDown = (event: KeyboardEvent) => {
        const platform = getPlatform();
        if (platform === 'Mac' && event.metaKey) {
            this.setState({
                isCmdKeyPressed: true,
            });
        }

        if (platform === 'Windows' && event.key === 'Control') {
            this.setState({
                isControlKeyPressed: true,
            });
        }

        if (
            (this.state.isCmdKeyPressed || this.state.isControlKeyPressed) &&
            event.key === 's'
        ) {
            event.preventDefault();
            this.saveTask();
        }
    };

    private onKeyUp = (event: KeyboardEvent) => {
        const platform = getPlatform();
        if (platform === 'Mac' && !event.metaKey) {
            this.setState({
                isCmdKeyPressed: false,
            });
        }

        if (platform === 'Windows' && event.key === 'Control') {
            this.setState({
                isControlKeyPressed: false,
            });
        }
    };

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

    private saveTask = () => {
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
