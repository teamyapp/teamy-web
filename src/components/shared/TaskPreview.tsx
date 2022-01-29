import classNames from 'classnames';
import moment from 'moment';
import React, {
    ChangeEvent,
    Component,
    KeyboardEvent,
    MouseEvent,
    ReactElement,
    createRef,
} from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TooltipUI } from '@lib/ui/Tooltip';
import { BoundingBoxFinder, Rect } from '@lib/ui/position';

import { Task } from '@core/entity/task';
import { TaskAction } from '@core/entity/taskAction';
import { FormatService } from '@core/service/format.service';
import { goalLengthLimit } from '@core/service/task.service';

import styles from './TaskPreview.module.scss';
import { UserProfileUI } from './UserProfile';

interface IProps {
    canViewDetail: boolean;
    task: Task;
    isEditing?: boolean;
    isOwnerSelected: boolean;
    showPastDue: boolean;
    onTaskDetailClick?: (taskId: string) => void;
    onTaskStartEditing?: (taskId: string) => void;
    onTaskFinishEditing?: (task: Task) => void;
    onDeleteTaskClick?: (taskId: string) => void;
    onStartTaskClick?: (taskId: string) => void;
    onCompleteTaskClick?: (taskId: string) => void;
    onShowPotentialTaskOwners?: (
        task: Task,
        findAlignTargetBoundBox: BoundingBoxFinder,
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
            <div key={index}>
                <TooltipUI message={'Report Blocked'}>
                    <div
                        className={`${styles.Action} ${styles.MarkTaskBlockIcon}`}
                    >
                        <MaterialIconUI>report</MaterialIconUI>
                    </div>
                </TooltipUI>
            </div>
        );
    }

    public render(): ReactElement {
        return (
            <div ref={this.ref} className={styles.Task}>
                <div className={styles.LeftSection}>
                    {this.props.task.id !== '-1' && (
                        <div className={styles.TopRow}>
                            <span
                                className={`${styles.Attribute} ${styles.Id}`}
                            >
                                #{this.props.task.id}
                            </span>
                        </div>
                    )}
                    {this.renderGoal()}
                    <div className={styles.BottomRow}>
                        {this.renderDueDate()}
                    </div>
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

    private renderStartTask(index: number): ReactElement {
        return (
            <div key={index}>
                <TooltipUI message={'Start'}>
                    <div
                        className={`${styles.Action} ${styles.StartTaskIcon}`}
                        onClick={this.onStartTaskClick}
                    >
                        <MaterialIconUI>play_arrow</MaterialIconUI>
                    </div>
                </TooltipUI>
            </div>
        );
    }

    private renderCompleteTask(index: number): ReactElement {
        return (
            <div key={index}>
                <TooltipUI message={'Complete'}>
                    <div
                        className={`${styles.Action} ${styles.TaskCompletedIcon}`}
                        onClick={this.onCompleteTaskClick}
                    >
                        <MaterialIconUI>check_circle</MaterialIconUI>
                    </div>
                </TooltipUI>
            </div>
        );
    }

    private renderDeleteTask(index: number): ReactElement {
        return (
            <div key={index}>
                <TooltipUI message={'Delete'}>
                    <div
                        className={`${styles.Action} ${styles.DeleteTaskIcon}`}
                        onClick={this.onDeleteTaskClick}
                    >
                        <MaterialIconUI>remove_circle</MaterialIconUI>
                    </div>
                </TooltipUI>
            </div>
        );
    }

    private renderAssignOwner(index: number): ReactElement {
        const name = this.props.task.owner
            ? FormatService.getShortName(
                  this.props.task.owner.firstName,
                  this.props.task.owner.lastName,
              )
            : 'Unassigned';
        return (
            <div key={index} className={styles.AssignOwner}>
                <TooltipUI message={name}>
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
                </TooltipUI>
            </div>
        );
    }

    private renderTaskDetail(index: number): ReactElement {
        return (
            <div key={index}>
                <TooltipUI message={'Detail'}>
                    <div
                        className={`${styles.Action} ${styles.TaskDetailIcon}`}
                        onClick={this.onTaskDetailClick}
                    >
                        <MaterialIconUI>settings</MaterialIconUI>
                    </div>
                </TooltipUI>
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

    private renderDueDate = () => {
        const dueAt = byTheEndOf(this.props.task.dueAt);
        const now = new Date();
        return (
            dueAt && (
                <div
                    className={`${styles.DueAt} ${classNames({
                        [styles.PastDue]: this.props.showPastDue
                            ? dueAt.getTime() < now.getTime()
                            : false,
                    })}`}
                >
                    <MaterialIconUI>alarm</MaterialIconUI>
                    <div className={styles.Time}>
                        {moment(this.props.task.dueAt).calendar({
                            lastDay: '[Yesterday]',
                            sameDay: '[Today]',
                            nextDay: '[Tomorrow]',
                            lastWeek: '[Last] dddd',
                            nextWeek: 'dddd',
                            sameElse: 'L',
                        })}
                    </div>
                </div>
            )
        );
    };

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
        this.props.onTaskStartEditing?.call(null, this.props.task.id);
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

function byTheEndOf(dateString?: string): Date | undefined {
    if (!dateString) {
        return undefined;
    }
    const date = new Date(dateString);
    date?.setHours(23);
    date?.setMinutes(59);
    date?.setSeconds(59);
    return date;
}
