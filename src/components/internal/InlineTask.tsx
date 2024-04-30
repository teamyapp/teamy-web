import { CleanupFunc, RenderFunc, ThirdPartyAppEventHub } from '@teamyapp/ext';
import classNames from 'classnames';
import React, {
    ChangeEvent,
    Component,
    MouseEvent,
    ReactNode,
    RefObject,
    createRef,
    KeyboardEvent
} from 'react';

import { RelativeLayout } from '@lib/layout/relativeLayout';
import { Duration } from '@lib/time/duration';
import { DateLabelPickerUI } from '@lib/ui/DateLabelPicker';
import { DropDownList, Option } from '@lib/ui/DropDownList';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TooltipUI } from '@lib/ui/Tooltip';

import { taskGoalLengthLimit } from '@core/config/config';
import { Deps } from '@core/dep/deps';
import { UpdateTaskInput } from '@core/entity/input';
import { Priority } from '@core/entity/priority';
import { Task } from '@core/entity/task';
import { TaskAction } from '@core/entity/taskAction';
import { TaskStatus } from '@core/entity/taskStatus';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import { ContextMenuComponent, MenuItem } from './ContextMenu.component';
import { DurationInputUI } from './DurationInput.ui';
import styles from './InlineTask.module.scss';
import { SelectOwnersPopupComponent } from './SelectOwnersPopupComponent';
import { TaskLinkIconUI } from './TaskLinkIcon';
import { dueDate, getUserShortName } from './format';
import { getPlatform } from '@lib/runtime/os';

const statusNames: Record<TaskStatus, string> = {
    TODO: 'Todo',
    PAUSED: 'Paused',
    IN_PROGRESS: 'In Progress',
    BLOCKED: 'Blocked',
    AWAITING: 'Awaiting',
    DELIVERED: 'Delivered',
};

const priorityOptions: Option[] = [
    {
        key: 'unset',
        description: '',
    },
    {
        key: 'urgent',
        description: 'Urgent',
    },
    {
        key: 'high',
        description: 'High',
    },
    {
        key: 'medium',
        description: 'Medium',
    },
    {
        key: 'low',
        description: 'Low',
    },
];

const priorityToOptionKey: Record<Priority, string> = {
    URGENT: 'urgent',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
};

const optionKeyToPriority: Record<string, Priority> = {
    urgent: 'URGENT',
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
};

interface ContextMenuItemView {
    viewRef: RefObject<HTMLDivElement>;
    renderFunc: RenderFunc;
}

interface Props {
    deps: Deps;
    relativeLayout: RelativeLayout;
    task: Task;
    filterTaskAction?: (action: TaskAction) => boolean;
    showStatus?: boolean;
    numActionColumns?: number;
    currentClientId?: number;
    isSelected?: boolean;
    thirdPartyAppEventHubs: ThirdPartyAppEventHub[];
    onStartEditingTask?: () => void;
    onFinishEditingTask?: () => void;
    onUpdateTask?: (taskId: number, task: UpdateTaskInput) => void;
    onStartTask?: (taskId: number) => void;
    onDeleteTask?: (taskId: number) => void;
    onCompleteTask?: (taskId: number) => void;
    onViewTaskDetail?: (taskId: number) => void;
    onReportTaskBlocked?: (taskId: number) => void;
    onTaskSelectHandler?: (taskId: number) => void;
}

interface State {
    isEditingGoal: boolean;
    updatedGoal?: string;
    isCmdKeyPressed: boolean;
    isControlKeyPressed: boolean;
}

export class InlineTaskUI extends Component<Props, State> {
    private readonly stateSyncer: StateSyncer;
    private readonly taskIdContextMenuRef = createRef<ContextMenuComponent>();
    private contextMenuItemViews: ContextMenuItemView[] = [];
    private contextMenuItemViewCleanups: CleanupFunc[] = [];

    constructor(props: Props) {
        super(props);
        this.stateSyncer = props.deps.stateSyncer;
        this.state = {
            isEditingGoal: false,
            isCmdKeyPressed: false,
            isControlKeyPressed: false,
        };
    }

    public render() {
        const { draggingBy } = this.props.task;

        const showDraggingBy =
            draggingBy && draggingBy.id !== this.props.currentClientId;
        const priorityStyle = toOptionKey(this.props.task.priority);
        return (
            <>
                <div
                    className={styles.InlineTask}
                    onClick={this.onSelectTaskHandler}
                >
                    <div
                        className={`${styles.Task} ${classNames({
                            [styles.Dragging]: showDraggingBy,
                            [styles.IsSelected]: this.props.isSelected,
                        })}`}
                    >
                        <div className={styles.LeftSection}>
                            <div className={styles.TopRow}>
                                <div
                                    className={`${styles.Attribute} ${styles.Id}`}
                                    onContextMenu={this.onTaskIdContextMenu}
                                >
                                    {this.props.task.id}
                                </div>
                                {this.props.showStatus && (
                                    <div
                                        className={`${styles.Attribute} ${
                                            styles.Status
                                        } ${styles[this.props.task.status]}`}
                                    >
                                        {statusNames[this.props.task.status]}
                                    </div>
                                )}
                            </div>
                            {this.renderGoal()}
                            <div className={styles.BottomRow}>
                                <div
                                    className={`${styles.Attribute} ${
                                        styles.Priority
                                    } ${classNames({
                                        [styles[priorityStyle]]: true,
                                    })}`}
                                >
                                    <DropDownList
                                        relativeLayout={this.props.deps.relativeLayout}
                                        selectOptionKey={toOptionKey(
                                            this.props.task.priority,
                                        )}
                                        options={priorityOptions}
                                        onSelectOption={
                                            this.onPrioritySelected
                                        }
                                        transformReferenceContainer={
                                            ({ showFollower, container }) => (
                                                <TooltipUI
                                                    relativeLayout={this.props.deps.relativeLayout}
                                                    disabled={showFollower}
                                                    message='Priority'>
                                                    {container}
                                                </TooltipUI>
                                            )
                                        }
                                    />
                                </div>
                                <div className={styles.Attribute}>
                                    {this.renderDueAt()}
                                </div>
                                <div className={styles.Attribute}>
                                    {this.renderEffort()}
                                </div>
                                {this.props.task.links.map((link) => (
                                    <div
                                        className={styles.Attribute}
                                        key={link.id}
                                    >
                                        <TaskLinkIconUI link={link} relativeLayout={this.props.deps.relativeLayout} />
                                    </div>
                                ))}
                            </div>
                            {this.props.task.awaitForTasks?.length > 0 &&
                                this.renderAwaitForTasks()}
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
                    {showDraggingBy && (
                        <div className={styles.DraggingBySection}>
                            {getUserShortName(
                                draggingBy.user.firstName,
                                draggingBy.user.lastName,
                            )}{' '}
                            is dragging
                        </div>
                    )}
                </div>
                <ContextMenuComponent
                    ref={this.taskIdContextMenuRef}
                    menuItems={this.renderTaskIdContextMenuItems()}
                    afterClose={this.onTaskIdContextMenuClose}
                />
            </>
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
                onKeyDown={this.onKeyDown}
                onKeyUp={this.onKeyUp}
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

        if ((this.state.isCmdKeyPressed || this.state.isControlKeyPressed) &&
            event.key === 's'
        ) {
            event.preventDefault();
            this.finishEditingGoal();
        }

        switch (event.key) {
            case 'Escape':
                this.cancelEditingGoal();
                break;
            default:
                break;
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

    private onSelectTaskHandler = () => {
        this.props.onTaskSelectHandler?.call(null, this.props.task.id);
    };

    private onTaskIdContextMenu = async (event: MouseEvent) => {
        event.preventDefault();
        await this.taskIdContextMenuRef.current?.open(
            event.clientY,
            event.clientX,
        );
        this.contextMenuItemViews.forEach((item) => {
            if (item.viewRef.current) {
                const cleanupFunc = item.renderFunc(item.viewRef.current);
                this.contextMenuItemViewCleanups.push(cleanupFunc);
            }
        });
    };

    private onTaskIdContextMenuClose = () => {
        this.contextMenuItemViewCleanups.forEach((cleanup) => cleanup());
        this.contextMenuItemViewCleanups = [];
    };

    private renderDueAt = () => {
        const { dueAt, deliveredAt } = this.props.task;
        const now = new Date();
        const endOfDueAt = byTheEndOf(dueAt)?.getTime();
        let warn = false;
        if (endOfDueAt) {
            warn = endOfDueAt < now.getTime();
            if (deliveredAt && deliveredAt.getTime() <= endOfDueAt) {
                warn = false;
            }
        }

        return (
            <DateLabelPickerUI
                relativeLayout={this.props.relativeLayout}
                value={dueAt}
                isWarn={warn}
                shownValue={dueAt && dueDate(dueAt)}
                onChange={this.handleEndDateChanged}
                transformReferenceContainer={({ showFollower, container }) => (
                    <TooltipUI
                        message='Due date'
                        disabled={showFollower}
                        relativeLayout={this.props.deps.relativeLayout}
                        preserveReferenceParentHeight={true}>
                        {container}
                    </TooltipUI>
                )}
            />
        );
    };

    private handleEndDateChanged = (date?: Date) => {
        this.props.onUpdateTask?.call(this, this.props.task.id, {
            ...this.getUpdatedTask(),
            dueAt: date,
        });
    };

    private onTaskOwnerSelected = (ownerUserId?: number) => {
        this.stateSyncer.updateTask(this.props.task.id, {
            ...this.getUpdatedTask(),
            ownerUserId,
        });
    };

    private renderEffort = () => {
        const { effort } = this.props.task;
        return (
            <DurationInputUI
                relativeLayout={this.props.relativeLayout}
                duration={effort}
                icon={
                    <MaterialIconUI iconStyle={'outlined'}>
                        weight
                    </MaterialIconUI>
                }
                canClear={true}
                onPopupOpen={this.onEffortPopupOpen}
                onPopupClose={this.onEffortPopupClose}
                onDurationChange={this.onEffortChange}
                transformReferenceContainer={({ showFollower, container }) => (
                    <TooltipUI
                        message='Effort'
                        disabled={showFollower}
                        relativeLayout={this.props.deps.relativeLayout}
                        preserveReferenceParentHeight={true}>
                        {container}
                    </TooltipUI>
                )}
            />
        );
    };

    private renderAwaitForTasks(): ReactNode {
        return (
            <div className={styles.AwaitForTasksSection}>
                <div className={styles.AwaitForIcon}>
                    <MaterialIconUI iconStyle={'rounded'}>
                        hourglass_top
                    </MaterialIconUI>
                </div>
                <div className={styles.AwaitForTasks}>
                    {this.props.task.awaitForTasks.map(this.renderAwaitForTask)}
                </div>
            </div>
        );
    }

    private renderAwaitForTask = (task: Task): ReactNode => {
        return (
            <div
                key={task.id}
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
                // return this.renderReportBlocked(index);
                return null
            case 'ADD_AWAIT_FOR_TASK':
                // return this.renderAddAwaitForTask(index);
                return null
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
                <TooltipUI message={'Start'} relativeLayout={this.props.deps.relativeLayout}>
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
                <TooltipUI message={'Report Blocked'} relativeLayout={this.props.deps.relativeLayout}>
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
                <TooltipUI message={'Await'} relativeLayout={this.props.deps.relativeLayout}>
                    <div
                        className={`${styles.Action}`}
                        onClick={this.onAddAwaitForTaskClick}
                    >
                        <div className={`${styles.AddAwaitForTaskIcon}`}>
                            <MaterialIconUI iconStyle={'rounded'}>
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
                <TooltipUI message={'Complete'} relativeLayout={this.props.deps.relativeLayout}>
                    <div
                        className={`${styles.Action}`}
                        onClick={this.onCompleteTaskClick}
                    >
                        <div className={` ${styles.CompleteTaskIcon}`}>
                            <MaterialIconUI>task_alt</MaterialIconUI>
                        </div>
                    </div>
                </TooltipUI>
            </div>
        );
    }

    private renderDeleteTask(index: number): ReactNode {
        return (
            <div key={index}>
                <TooltipUI message={'Delete'} relativeLayout={this.props.deps.relativeLayout}>
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

    private renderAssignOwner = (index: number): ReactNode => {
        return (
            <SelectOwnersPopupComponent
                key={index}
                deps={this.props.deps}
                onSelectOwner={this.onTaskOwnerSelected}
                selectedOwner={this.props.task.owner}
            />
        );
    };

    private renderViewTaskDetail(index: number): ReactNode {
        return (
            <div key={index}>
                <TooltipUI message={'Detail'} relativeLayout={this.props.deps.relativeLayout}>
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

    private renderTaskIdContextMenuItems = (): MenuItem[] => {
        const menuItems: MenuItem[] = [];
        this.props.thirdPartyAppEventHubs.forEach((hub) => {
            hub.onShowTaskIdActions(this.props.task.id).forEach((action) => {
                const viewRef = createRef<HTMLDivElement>();
                menuItems.push({
                    key: `${hub.appId}/${action.key}`,
                    label: <div ref={viewRef} />,
                    action: action.execute,
                });
                this.contextMenuItemViews.push({
                    viewRef,
                    renderFunc: action.renderView,
                });
            });
        });
        return menuItems;
    };

    private onStartTaskClick = (event: MouseEvent) => {
        event.stopPropagation();
        this.props.onStartTask?.call(null, this.props.task.id);
    };

    private onReportTaskBlockedClick = (event: MouseEvent) => {
        event.stopPropagation();
        this.props.onReportTaskBlocked?.call(null, this.props.task.id);
    };

    private onCompleteTaskClick = (event: MouseEvent) => {
        event.stopPropagation();
        this.props.onCompleteTask?.call(null, this.props.task.id);
    };

    private onDeleteTaskClick = (event: MouseEvent) => {
        event.stopPropagation();
        this.props.onDeleteTask?.call(null, this.props.task.id);
    };

    private onViewTaskDetailClick = (event: MouseEvent) => {
        event.stopPropagation();
        this.props.onViewTaskDetail?.call(null, this.props.task.id);
    };

    private onAddAwaitForTaskClick = (event: MouseEvent) => {
        // TODO: allow user to pick awaiting task
    };

    private onGoalBlur = () => {
        this.finishEditingGoal();
    };

    private onGoalChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
        this.setState({
            updatedGoal: event.target.value,
        });
    };

    private onGoalDoubleClick = () => {
        this.props.onStartEditingTask?.call(null);
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
        this.props.onFinishEditingTask?.call(null);
    }

    private cancelEditingGoal = () => {
        this.setState({
            isEditingGoal: false,
            updatedGoal: undefined,
        });
        this.props.onFinishEditingTask?.call(null);
    }

    private getUpdatedTask(): UpdateTaskInput {
        return {
            goal: this.state.updatedGoal || this.props.task.goal,
            context: this.props.task.context,
            ownerUserId: this.props.task.owner?.id,
            owningTeamId: this.props.task.owningTeam.id,
            effort: this.props.task.effort,
            priority: this.props.task.priority,
            dueAt: this.props.task.dueAt,
        };
    }

    private onEffortPopupOpen = () => {
        this.props.onStartEditingTask?.call(null);
    };

    private onEffortPopupClose = () => {
        this.props.onFinishEditingTask?.call(null);
    };

    private onEffortChange = (effort?: Duration) => {
        this.props.onUpdateTask?.call(this, this.props.task.id, {
            ...this.getUpdatedTask(),
            effort: effort,
        });
    };

    private onPrioritySelected = (optionKey: string) => {
        const priority = toPriority(optionKey);
        this.props.onUpdateTask?.call(this, this.props.task.id, {
            ...this.getUpdatedTask(),
            priority: priority,
        });
    };
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

function toOptionKey(priority?: Priority): string {
    if (!priority) {
        return 'unset';
    }

    return priorityToOptionKey[priority];
}

function toPriority(optionKey: string): Priority | undefined {
    if (optionKey == 'unset') {
        return;
    }

    return optionKeyToPriority[optionKey];
}
