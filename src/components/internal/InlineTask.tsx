import classNames from 'classnames';
import React, {
    ChangeEvent,
    Component,
    KeyboardEvent,
    MouseEvent,
    ReactNode,
} from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { NamedValueUI } from '@lib/ui/NamedValue';
import { TooltipUI } from '@lib/ui/Tooltip';
import { BoundingBoxFinder, Rect } from '@lib/ui/position';

import { taskGoalLengthLimit } from '@core/config/config';
import { UpdateTaskInput } from '@core/entity/input';
import { Task } from '@core/entity/task';
import { TaskAction } from '@core/entity/taskAction';
import { TaskStatus } from '@core/entity/taskStatus';
import { FormatService } from '@core/service/format.service';

import styles from './InlineTask.module.scss';
import { UserProfileUI } from './UserProfile';

const statusNames: Record<TaskStatus, string> = {
    UPCOMING: 'Upcoming',
    PAUSED: 'Paused',
    IN_PROGRESS: 'In Progress',
    BLOCKED: 'Blocked',
    AWAITING: 'Awaiting',
    DELIVERED: 'Delivered',
};

interface Props {
    task: Task;
    filterTaskAction?: (action: TaskAction) => boolean;
    showStatus?: boolean;
    numActionColumns?: number;
    isSelectingOwner?: boolean;
    onStartEditingTask?: () => void;
    onFinishEditingTask?: () => void;
    onUpdateTask?: (taskId: number, task: UpdateTaskInput) => void;
    onStartTask?: (taskId: number) => void;
    onDeleteTask?: (taskId: number) => void;
    onCompleteTask?: (taskId: number) => void;
    onViewTaskDetail?: (taskId: number) => void;
    onReportTaskBlocked?: (taskId: number) => void;
    onShowPotentialTaskOwners?: (
        taskId: number,
        updateTaskInput: UpdateTaskInput,
        findAlignTargetBoundBox: BoundingBoxFinder,
        selectedOwnerId?: number,
    ) => void;
}

interface State {
    isEditingGoal: boolean;
    updatedGoal?: string;
}

export class InlineTaskUI extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isEditingGoal: false,
        };
    }

    public render() {
        return (
            <div className={styles.Task}>
                <div className={styles.LeftSection}>
                    <div className={styles.TopRow}>
                        <span className={`${styles.Attribute} ${styles.Id}`}>
                            {this.props.task.id}
                        </span>
                        {this.props.showStatus && (
                            <span
                                className={`${styles.Attribute} ${
                                    styles.Status
                                } ${styles[this.props.task.status]}`}
                            >
                                {statusNames[this.props.task.status]}
                            </span>
                        )}
                    </div>
                    {this.renderGoal()}
                    <div className={styles.BottomRow}>{this.renderDueAt()}</div>
                    {/*<div className={styles.Attributes}>*/}
                    {/*    {this.renderEffort()}*/}
                    {/*</div>*/}
                    <div className={styles.AwaitFor}>
                        {this.props.task.awaitForTasks?.length > 0 &&
                            this.renderAwaitForTasks()}
                    </div>
                </div>
                <div
                    className={styles.ActionsSection}
                    style={{
                        gridTemplateColumns: `repeat(${
                            this.props.numActionColumns || 3
                        }, 1fr)`,
                    }}
                >
                    {this.renderActions()}
                </div>
            </div>
        );
    }

    private renderGoal(): ReactNode {
        return this.state.isEditingGoal ? (
            <textarea
                autoFocus
                maxLength={taskGoalLengthLimit}
                className={styles.GoalTextField}
                value={this.state.updatedGoal || ''}
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

    private renderDueAt = () => {
        const { dueAt } = this.props.task;
        const endOfDueAt = byTheEndOf(dueAt);
        const now = new Date();
        return (
            dueAt &&
            endOfDueAt && (
                <div
                    className={`${styles.DueAt} ${classNames({
                        [styles.PastDue]: endOfDueAt.getTime() < now.getTime(),
                    })}`}
                >
                    <MaterialIconUI>alarm</MaterialIconUI>
                    <div className={styles.Time}>
                        {FormatService.dueDate(dueAt)}
                    </div>
                </div>
            )
        );
    };

    private renderEffort = () => {
        const { effort } = this.props.task;
        return (
            effort && (
                <span className={styles.EffortAttribute}>
                    <NamedValueUI name={'Effort'} value={`${effort}`} />
                </span>
            )
        );
    };

    private renderAwaitForTasks(): ReactNode {
        return (
            <div className={styles.AwaitForTasksSection}>
                <div className={styles.AwaitForIcon}>
                    <MaterialIconUI iconStyle={'round'}>
                        hourglass_top
                    </MaterialIconUI>
                </div>
                <div className={styles.AwaitForTasks}>
                    {this.props.task.awaitForTasks.map(this.renderAwaitForTask)}
                </div>
            </div>
        );
    }

    private renderAwaitForTask = (task: Task, index: number): ReactNode => {
        return (
            <div
                key={index}
                className={`${styles.AwaitForTask} ${classNames({
                    [styles.Delivered]: task.status === 'DELIVERED',
                })}`}
            >
                {task.id}
            </div>
        );
    };

    private renderActions(): ReactNode[] {
        let actions = this.props.task.availableActions.concat('VIEW_DETAIL');
        if (this.props.filterTaskAction) {
            actions = actions.filter(this.props.filterTaskAction);
        }

        return actions.map(this.renderAction);
    }

    private renderAction = (action: TaskAction, index: number): ReactNode => {
        switch (action) {
            case 'START':
                return this.renderStartTask(index);
            case 'MARK_COMPLETE':
                return this.renderCompleteTask(index);
            case 'REPORT_BLOCKED':
                return this.renderReportBlocked(index);
            case 'ADD_AWAIT_FOR_TASK':
                return this.renderAddAwaitForTask(index);
            case 'ASSIGN_OWNER':
                return this.renderAssignOwner(index);
            case 'DELETE':
                return this.renderDeleteTask(index);
            case 'VIEW_DETAIL':
                return this.renderViewTaskDetail(index);
        }
    };

    private renderStartTask(index: number): ReactNode {
        return (
            <div key={index}>
                <TooltipUI message={'Start'}>
                    <div
                        className={`${styles.Action}`}
                        onClick={this.onStartTaskClick}
                    >
                        <div className={styles.StartTaskIcon}>
                            <MaterialIconUI>play_arrow</MaterialIconUI>
                        </div>
                    </div>
                </TooltipUI>
            </div>
        );
    }

    private renderReportBlocked(index: number): ReactNode {
        return (
            <div key={index}>
                <TooltipUI message={'Report Blocked'}>
                    <div
                        className={`${styles.Action}`}
                        onClick={this.onReportTaskBlockedClick}
                    >
                        <div className={styles.ReportTaskBlockedIcon}>
                            <MaterialIconUI>priority_high</MaterialIconUI>
                        </div>
                    </div>
                </TooltipUI>
            </div>
        );
    }

    private renderAddAwaitForTask(index: number) {
        return (
            <div key={index}>
                <TooltipUI message={'Await'}>
                    <div
                        className={`${styles.Action}`}
                        onClick={this.onAddAwaitForTaskClick}
                    >
                        <div className={`${styles.AddAwaitForTaskIcon}`}>
                            <MaterialIconUI iconStyle={'round'}>
                                move_up
                            </MaterialIconUI>
                        </div>
                    </div>
                </TooltipUI>
            </div>
        );
    }

    private renderCompleteTask(index: number): ReactNode {
        return (
            <div key={index}>
                <TooltipUI message={'Complete'}>
                    <div
                        className={`${styles.Action}`}
                        onClick={this.onCompleteTaskClick}
                    >
                        <div className={` ${styles.CompleteTaskIcon}`}>
                            <MaterialIconUI>check</MaterialIconUI>
                        </div>
                    </div>
                </TooltipUI>
            </div>
        );
    }

    private renderDeleteTask(index: number): ReactNode {
        return (
            <div key={index}>
                <TooltipUI message={'Delete'}>
                    <div
                        className={`${styles.Action}`}
                        onClick={this.onDeleteTaskClick}
                    >
                        <div className={` ${styles.DeleteTaskIcon}`}>
                            <MaterialIconUI>close</MaterialIconUI>
                        </div>
                    </div>
                </TooltipUI>
            </div>
        );
    }

    private renderAssignOwner(index: number): ReactNode {
        const owner = this.props.task.owner;
        const name = owner
            ? FormatService.getShortName(owner.firstName, owner.lastName)
            : 'Unassigned';
        return (
            <div key={index} className={styles.AssignOwner}>
                <TooltipUI message={name}>
                    <div
                        className={`${styles.Action} ${classNames({
                            [styles.Active]:
                                this.props.isSelectingOwner || false,
                        })}`}
                        onClick={this.onAssignOwnerClick}
                    >
                        <div className={` ${styles.AssignOwnerIcon}`}>
                            {owner ? (
                                <UserProfileUI user={owner} />
                            ) : (
                                <MaterialIconUI>face</MaterialIconUI>
                            )}
                        </div>
                    </div>
                </TooltipUI>
            </div>
        );
    }

    private renderViewTaskDetail(index: number): ReactNode {
        return (
            <div key={index}>
                <TooltipUI message={'Detail'}>
                    <div
                        className={`${styles.Action}`}
                        onClick={this.onViewTaskDetailClick}
                    >
                        <div className={styles.ViewTaskDetailIcon}>
                            <MaterialIconUI>settings</MaterialIconUI>
                        </div>
                    </div>
                </TooltipUI>
            </div>
        );
    }

    private onStartTaskClick = () => {
        this.props.onStartTask?.call(null, this.props.task.id);
    };

    private onReportTaskBlockedClick = () => {
        this.props.onReportTaskBlocked?.call(null, this.props.task.id);
    };

    private onCompleteTaskClick = () => {
        this.props.onCompleteTask?.call(null, this.props.task.id);
    };

    private onDeleteTaskClick = () => {
        this.props.onDeleteTask?.call(null, this.props.task.id);
    };

    private onViewTaskDetailClick = () => {
        this.props.onViewTaskDetail?.call(null, this.props.task.id);
    };

    private onAssignOwnerClick = (event: MouseEvent<HTMLDivElement>) => {
        const element = event.currentTarget as HTMLDivElement;
        this.props.onShowPotentialTaskOwners?.call(
            null,
            this.props.task.id,
            this.getUpdatedTask(),
            (): Rect => {
                return element.getBoundingClientRect();
            },
            this.props.task.owner?.id,
        );
    };

    private onAddAwaitForTaskClick = (event: MouseEvent<HTMLDivElement>) => {
        // TODO: allow user to pick awaiting task
    };

    private onGoalBlur = () => {
        this.finishEditingGoal();
    };

    private onGoalKeyDown = (
        event: KeyboardEvent<HTMLTextAreaElement>,
    ): void => {
        switch (event.key) {
            case 'Escape':
                this.finishEditingGoal();
                return;
        }
    };

    private onGoalChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
        this.setState({
            updatedGoal: event.target.value,
        });
    };

    private onGoalDoubleClick = () => {
        this.setState({
            isEditingGoal: true,
            updatedGoal: this.props.task.goal,
        });
    };

    private finishEditingGoal() {
        this.props.onUpdateTask?.call(
            null,
            this.props.task.id,
            this.getUpdatedTask(),
        );
        this.setState({
            isEditingGoal: false,
            updatedGoal: undefined,
        });
    }

    private getUpdatedTask(): UpdateTaskInput {
        return {
            goal: this.state.updatedGoal || this.props.task.goal,
            context: this.props.task.context,
            ownerUserId: this.props.task.owner?.id,
            owningTeamId: this.props.task.owningTeam.id,
            effort: this.props.task.effort,
            dueAt: this.props.task.dueAt,
        };
    }
}

function byTheEndOf(date?: Date): Date | undefined {
    if (!date) {
        return undefined;
    }

    const newDate = new Date(date.getTime());
    newDate.setHours(23);
    newDate.setMinutes(59);
    newDate.setSeconds(59);
    return newDate;
}
