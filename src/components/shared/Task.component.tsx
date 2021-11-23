import {
    ChangeEvent,
    KeyboardEvent,
    Component,
    createRef,
    ReactElement,
} from 'react';
import Task from '../../entity/Task';
import { TaskAction } from '../../entity/TaskAction';
import MaterialIconComponent from '../ui/MaterialIcon.component';
import NamedValueComponent from '../ui/NamedValue.component';
import AssigneeComponent from './Assignee.component';
import styles from './Task.component.module.scss';

const goalLengthLimit = 70;

export interface OnTaskDetailClick {
    (taskId: number): void;
}

interface IProps {
    task: Task;
    isEditing?: boolean;
    onTaskDetailClick?: OnTaskDetailClick;
    onTaskChanged?: (task: Task) => void;
    onTaskFinishEditing?: (task: Task) => void;
}

interface IState {
    task: Task;
    isEditing: boolean;
}

export default class TaskComponent extends Component<IProps, IState> {
    private ref = createRef<HTMLDivElement>();

    constructor(props: IProps) {
        super(props);
        this.state = {
            task: this.props.task,
            isEditing: props.isEditing || false,
        };
    }

    private static renderStartTask(): ReactElement {
        return (
            <span className={styles.StartTaskIcon}>
                <MaterialIconComponent>play_arrow</MaterialIconComponent>
            </span>
        );
    }

    private static renderMarkTaskCompleted(): ReactElement {
        return (
            <span className={styles.TaskCompletedIcon}>
                <MaterialIconComponent>check_circle</MaterialIconComponent>
            </span>
        );
    }

    private static renderReportBlocked(): ReactElement {
        return (
            <span className={styles.MarkTaskBlockIcon}>
                <MaterialIconComponent>report</MaterialIconComponent>
            </span>
        );
    }

    private static renderDeleteTask(): ReactElement {
        return (
            <span className={styles.DeleteTaskIcon}>
                <MaterialIconComponent>remove_circle</MaterialIconComponent>
            </span>
        );
    }

    private static renderAssignOwner(): ReactElement {
        return <AssigneeComponent />;
    }

    public render(): ReactElement {
        return (
            <div ref={this.ref} className={styles.Task}>
                <div className={styles.LeftSection}>
                    {this.renderGoal()}
                    {this.state.task.dueAt && (
                        <div className={styles.DueAt}>
                            Due:{' '}
                            {new Date(this.state.task.dueAt).toLocaleString()}
                        </div>
                    )}
                    <div className={styles.Attributes}>
                        {this.state.task.effort && (
                            <span className={styles.EffortAttribute}>
                                <NamedValueComponent
                                    name={'Effort'}
                                    value={`${this.state.task.effort}`}
                                />
                            </span>
                        )}
                    </div>
                </div>
                {this.state.task.availableActions && (
                    <div className={styles.ActionsSection}>
                        {this.renderActions()}
                    </div>
                )}
            </div>
        );
    }

    private renderGoal(): ReactElement {
        return this.state.isEditing ? (
            <textarea
                autoFocus
                maxLength={goalLengthLimit}
                className={styles.GoalTextField}
                value={this.state.task.goal}
                onChange={this.onGoalChange}
                onKeyDown={this.onGoalKeyDown}
                onBlur={this.onGoalTextFieldBlur}
            />
        ) : (
            <div className={styles.Goal}>{this.state.task.goal}</div>
        );
    }

    private renderTaskDetail(): ReactElement {
        return (
            <span
                className={styles.TaskDetailIcon}
                onClick={this.onTaskDetailClick}
            >
                <MaterialIconComponent>settings</MaterialIconComponent>
            </span>
        );
    }

    private renderAction(action: TaskAction): ReactElement {
        switch (action) {
            case TaskAction.Start:
                return TaskComponent.renderStartTask();
            case TaskAction.MarkComplete:
                return TaskComponent.renderMarkTaskCompleted();
            case TaskAction.ReportBlocked:
                return TaskComponent.renderReportBlocked();
            case TaskAction.AssignOwner:
                return TaskComponent.renderAssignOwner();
            case TaskAction.Delete:
                return TaskComponent.renderDeleteTask();
            case TaskAction.ViewDetail:
                return this.renderTaskDetail();
        }
    }

    private renderActions(): ReactElement[] {
        return this.state.task.availableActions
            .concat(TaskAction.ViewDetail)
            .map((action: TaskAction, index: number) => {
                return (
                    <div className={styles.Action} key={index}>
                        {this.renderAction(action)}
                    </div>
                );
            });
    }

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
        const task = Object.assign({}, this.state.task, {
            goal: event.target.value,
        });
        this.setState({
            task: task,
        });
        this.props.onTaskChanged?.call(this, task);
    };

    private onGoalTextFieldBlur = (): void => {
        this.finishEditing();
    };

    private finishEditing() {
        this.setState({
            isEditing: false,
        });
        this.props.onTaskFinishEditing?.call(this, this.state.task);
    }

    private onTaskDetailClick = (): void => {
        this.props.onTaskDetailClick?.call(this, this.state.task.id);
    };
}
