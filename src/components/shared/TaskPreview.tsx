import classNames from 'classnames';
import React, {
    ChangeEvent,
    Component,
    KeyboardEvent,
    MouseEvent,
    ReactElement,
    createRef,
} from 'react';

import * as csp from '@lib/csp/csp';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import * as events from '@core/entity/events';
import { IBoundingBoxFinder, Rect } from '@core/entity/position';
import { Task } from '@core/entity/task';
import { TaskAction } from '@core/entity/taskAction';
import { TaskStatus } from '@core/entity/taskStatus';
import { task } from '@core/service/queries';

// import { NamedValueUI } from '@ui/NamedValue';
import styles from './TaskPreview.module.scss';
import { UserProfileUI } from './UserProfile';

const goalLengthLimit = 70;

interface IProps {
    canViewDetail: boolean;
    task: Task;
    isEditing?: boolean;
    isOwnerSelected: boolean;
    multiCaster: csp.Multicaster<events.MutationEvent>;
    onTaskDetailClick?: (taskId: number) => void;
    onTaskFinishEditing?: (task: Task) => void;
    onDeleteTaskClick?: (taskId: number) => void;
    onStartTaskClick?: (taskId: number) => void;
    onCompleteTaskClick?: (taskId: number) => void;
    onShowPotentialTaskOwners?: (
        task: Task,
        findAlignTargetBoundBox: IBoundingBoxFinder,
    ) => void;
}

interface IState {
    editingTask?: Task;
    isEditing: boolean;
}

export class TaskPreviewUI extends Component<IProps, IState> {
    private ref = createRef<HTMLDivElement>();

    constructor(props: IProps) {
        super(props);
        this.state = {
            editingTask: this.props.task,
            isEditing: props.isEditing || false,
        };
    }

    private static renderReportBlocked(index: number): ReactElement {
        return (
            <div
                className={`${styles.Action} ${styles.MarkTaskBlockIcon}`}
                key={index}
            >
                <MaterialIconUI>report</MaterialIconUI>
            </div>
        );
    }

    public render(): ReactElement {
        return (
            <div ref={this.ref} className={styles.Task}>
                <div className={styles.LeftSection}>
                    {this.props.task.id > 0 && (
                        <div className={styles.TopRow}>
                            <span
                                className={`${styles.Attribute} ${styles.Id}`}
                            >
                                #{this.props.task.id}
                            </span>
                        </div>
                    )}
                    {this.renderGoal()}
                    {this.props.task.dueAt && (
                        <div className={styles.DueAt}>
                            Due:{' '}
                            {new Date(this.props.task.dueAt).toLocaleString()}
                        </div>
                    )}
                    {/*<div className={styles.Attributes}>*/}
                    {/*    {this.state.task.effort && (*/}
                    {/*        <span className={styles.EffortAttribute}>*/}
                    {/*            <NamedValueUI*/}
                    {/*                name={'Effort'}*/}
                    {/*                value={`${this.state.task.effort}`}*/}
                    {/*            />*/}
                    {/*        </span>*/}
                    {/*    )}*/}
                    {/*</div>*/}
                </div>
                {this.props.task.availableActions && (
                    <div className={styles.ActionsSection}>
                        {this.renderActions()}
                    </div>
                )}
            </div>
        );
    }

    private renderCompleteTask(index: number): ReactElement {
        return (
            <div
                className={`${styles.Action} ${styles.TaskCompletedIcon}`}
                key={index}
                onClick={this.onCompleteTaskClick}
            >
                <MaterialIconUI>check_circle</MaterialIconUI>
            </div>
        );
    }

    private renderStartTask(index: number): ReactElement {
        return (
            <div
                className={`${styles.Action} ${styles.StartTaskIcon}`}
                key={index}
                onClick={this.onStartTaskClick}
            >
                <MaterialIconUI>play_arrow</MaterialIconUI>
            </div>
        );
    }

    private renderDeleteTask(index: number): ReactElement {
        return (
            <div
                className={`${styles.Action} ${styles.DeleteTaskIcon}`}
                key={index}
                onClick={this.onDeleteTaskClick}
            >
                <MaterialIconUI>remove_circle</MaterialIconUI>
            </div>
        );
    }

    private renderAssignOwner(index: number): ReactElement {
        return (
            <div key={index} className={styles.AssignOwner}>
                <div
                    className={`${styles.Action} ${
                        styles.AssignOwnerIcon
                    } ${classNames({
                        [styles.Active]: this.props.isOwnerSelected,
                    })}`}
                    onClick={this.onAssignOwnerClick}
                >
                    {this.props.task.owner ? (
                        <UserProfileUI user={this.props.task.owner} />
                    ) : (
                        <MaterialIconUI>face</MaterialIconUI>
                    )}
                </div>
            </div>
        );
    }

    private renderTaskDetail(index: number): ReactElement {
        return (
            <div
                className={`${styles.Action} ${styles.TaskDetailIcon}`}
                key={index}
                onClick={this.onTaskDetailClick}
            >
                <MaterialIconUI>settings</MaterialIconUI>
            </div>
        );
    }

    private renderGoal(): ReactElement {
        return this.state.isEditing ? (
            <textarea
                autoFocus
                maxLength={goalLengthLimit}
                className={styles.GoalTextField}
                value={this.state.editingTask?.goal || ''}
                onChange={this.onGoalChange}
                onKeyDown={this.onGoalKeyDown}
                onBlur={this.onGoalBlur}
            />
        ) : (
            <div className={styles.Goal} onDoubleClick={this.onGoalDoubleClick}>
                {this.props.task.goal || (
                    <span className={styles.Placeholder}>
                        Set a goal for me
                    </span>
                )}
            </div>
        );
    }

    private renderAction = (
        action: TaskAction,
        index: number,
    ): ReactElement => {
        switch (action) {
            case TaskAction.Start:
                return this.renderStartTask(index);
            case TaskAction.MarkComplete:
                return this.renderCompleteTask(index);
            case TaskAction.ReportBlocked:
                return TaskPreviewUI.renderReportBlocked(index);
            case TaskAction.AssignOwner:
                return this.renderAssignOwner(index);
            case TaskAction.Delete:
                return this.renderDeleteTask(index);
            case TaskAction.ViewDetail:
                return this.renderTaskDetail(index);
        }
    };

    private renderActions(): ReactElement[] {
        let actions = this.props.task.availableActions;
        if (this.props.canViewDetail) {
            actions = actions.concat(TaskAction.ViewDetail);
        }
        return actions.map(this.renderAction);
    }

    private onGoalBlur = () => {
        this.finishEditing();
    };

    private onGoalKeyDown = (
        event: KeyboardEvent<HTMLTextAreaElement>,
    ): void => {
        switch (event.key) {
            case 'Escape':
                this.finishEditing();
                return;
        }
    };

    private onGoalChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
        this.setState({
            editingTask: Object.assign({}, this.state.editingTask, {
                goal: event.target.value,
            }),
        });
    };

    private onGoalDoubleClick = () => {
        this.setState({
            editingTask: this.props.task,
            isEditing: true,
        });
    };

    private finishEditing() {
        this.setState({
            editingTask: undefined,
            isEditing: false,
        });
        this.props.onTaskFinishEditing?.call(this, this.state.editingTask!);
    }

    private onTaskDetailClick = (): void => {
        this.props.onTaskDetailClick?.call(null, this.props.task.id);
    };

    private onDeleteTaskClick = (): void => {
        this.props.onDeleteTaskClick?.call(null, this.props.task.id);
    };

    private onStartTaskClick = (): void => {
        this.props.onStartTaskClick?.call(null, this.props.task.id);
    };

    private onCompleteTaskClick = (): void => {
        this.props.onCompleteTaskClick?.call(null, this.props.task.id);
    };

    private onAssignOwnerClick = (event: MouseEvent<HTMLDivElement>): void => {
        const element = event.currentTarget as HTMLDivElement;
        this.props.onShowPotentialTaskOwners?.call(
            null,
            this.props.task,
            (): Rect => {
                return element.getBoundingClientRect();
            },
        );
    };
}
