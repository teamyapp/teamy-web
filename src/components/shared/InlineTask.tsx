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
import { FormatService } from '@core/service/format.service';

import { UserProfileUI } from './UserProfile';
import styles from './InlineTask.module.scss';

interface Props {
    task: Task;
    isSelectingOwner: boolean;
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
    updateTaskInput: UpdateTaskInput;
}

export class InlineTaskUI extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isEditingGoal: false,
            updateTaskInput: {
                goal: props.task.goal,
                context: props.task.context,
                ownerUserId: props.task.owner?.id,
                owningTeamId: props.task.owningTeam.id,
                effort: props.task.effort,
                dueAt: props.task.dueAt,
            },
        };
    }

    public render() {
        return (
            <div className={styles.Task}>
                <div className={styles.LeftSection}>
                    <div className={styles.TopRow}>
                        <span className={`${styles.Attribute} ${styles.Id}`}>
                            #{this.props.task.id}
                        </span>
                    </div>
                    {this.renderGoal()}
                    <div className={styles.BottomRow}>{this.renderDueAt()}</div>
                    <div className={styles.Attributes}>
                        {this.renderEffort()}
                    </div>
                </div>
                <div className={styles.ActionsSection}>
                    {this.renderActions()}
                </div>
            </div>
        );
    }

    private renderGoal(): ReactNode {
        const { goal } = this.state.updateTaskInput;
        return this.state.isEditingGoal ? (
            <textarea
                autoFocus
                maxLength={taskGoalLengthLimit}
                className={styles.GoalTextField}
                value={goal || ''}
                onChange={this.onGoalChange}
                onKeyDown={this.onGoalKeyDown}
                onBlur={this.onGoalBlur}
            />
        ) : (
            <div className={styles.Goal} onDoubleClick={this.onGoalDoubleClick}>
                {goal || (
                    <span className={styles.Placeholder}>
                        Set a goal for me
                    </span>
                )}
            </div>
        );
    }

    private renderDueAt = () => {
        const { dueAt } = this.state.updateTaskInput;
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
        const { effort } = this.state.updateTaskInput;
        return (
            effort && (
                <span className={styles.EffortAttribute}>
                    <NamedValueUI name={'Effort'} value={`${effort}`} />
                </span>
            )
        );
    };

    private renderActions(): ReactNode[] {
        let actions = this.props.task.availableActions.concat('VIEW_DETAIL');
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
                        className={`${styles.Action} ${styles.StartTaskIcon}`}
                        onClick={this.onStartTaskClick}
                    >
                        <MaterialIconUI>play_arrow</MaterialIconUI>
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
                        className={`${styles.Action} ${styles.ReportTaskBlockedIcon}`}
                        onClick={this.onReportTaskBlockedClick}
                    >
                        <MaterialIconUI>report</MaterialIconUI>
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
                        className={`${styles.Action} ${styles.CompleteTaskIcon}`}
                        onClick={this.onCompleteTaskClick}
                    >
                        <MaterialIconUI>check_circle</MaterialIconUI>
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
                        className={`${styles.Action} ${styles.DeleteTaskIcon}`}
                        onClick={this.onDeleteTaskClick}
                    >
                        <MaterialIconUI>remove_circle</MaterialIconUI>
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
                        className={`${styles.Action} ${
                            styles.AssignOwnerIcon
                        } ${classNames({
                            [styles.Active]: this.props.isSelectingOwner,
                        })}`}
                        onClick={this.onAssignOwnerClick}
                    >
                        {owner ? (
                            <UserProfileUI user={owner} />
                        ) : (
                            <MaterialIconUI>face</MaterialIconUI>
                        )}
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
                        className={`${styles.Action} ${styles.ViewTaskDetailIcon}`}
                        onClick={this.onViewTaskDetailClick}
                    >
                        <MaterialIconUI>more_vert</MaterialIconUI>
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
            this.state.updateTaskInput,
            (): Rect => {
                return element.getBoundingClientRect();
            },
            this.props.task.owner?.id,
        );
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
            updateTaskInput: Object.assign({}, this.state.updateTaskInput, {
                goal: event.target.value,
            }),
        });
    };

    private onGoalDoubleClick = () => {
        this.setState({
            isEditingGoal: true,
        });
    };

    private finishEditingGoal() {
        this.setState({
            isEditingGoal: false,
        });
        this.props.onUpdateTask?.call(
            null,
            this.props.task.id,
            this.state.updateTaskInput,
        );
    }
}

function byTheEndOf(date?: Date): Date | undefined {
    if (!date) {
        return undefined;
    }

    date?.setHours(23);
    date?.setMinutes(59);
    date?.setSeconds(59);
    return date;
}
