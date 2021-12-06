import classNames from 'classnames';
import React, {
    ChangeEvent,
    Component,
    createRef,
    KeyboardEvent,
    ReactElement,
} from 'react';
import Task from '../../entity/Task';
import { TaskAction } from '../../entity/TaskAction';
import { User } from '../../entity/User';
import MaterialIconComponent from '../ui/MaterialIcon.component';
import NamedValueComponent from '../ui/NamedValue.component';
import { SelectUserListComponent } from './SelectUserList.component';
import styles from './Task.component.module.scss';
import { UserProfile } from './UserProfile.component';

const goalLengthLimit = 70;

interface IProps {
    canViewDetail: boolean;
    task: Task;
    isEditing?: boolean;
    findPotentialOwners?: (taskId: number) => Promise<User[]>;
    onTaskDetailClick?: (taskId: number) => void;
    onTaskChanged?: (task: Task) => void;
    onTaskFinishEditing?: (task: Task) => void;
    onDeleteTaskClick?: (taskId: number) => void;
    onStartTaskClick?: (taskId: number) => void;
    onCompleteTaskClick?: (taskId: number) => void;
}

interface IState {
    task: Task;
    isEditing: boolean;
    showTeamMembersList: boolean;
    potentialOwners: User[];
}

export default class TaskComponent extends Component<IProps, IState> {
    private ref = createRef<HTMLDivElement>();

    constructor(props: IProps) {
        super(props);
        this.state = {
            task: this.props.task,
            isEditing: props.isEditing || false,
            showTeamMembersList: false,
            potentialOwners: [],
        };
    }

    private renderCompleteTask(index: number): ReactElement {
        return (
            <div
                className={`${styles.Action} ${styles.TaskCompletedIcon}`}
                key={index}
                onClick={this.onCompleteTaskClick}
            >
                <MaterialIconComponent>check_circle</MaterialIconComponent>
            </div>
        );
    }

    private static renderReportBlocked(index: number): ReactElement {
        return (
            <div
                className={`${styles.Action} ${styles.MarkTaskBlockIcon}`}
                key={index}
            >
                <MaterialIconComponent>report</MaterialIconComponent>
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
                <MaterialIconComponent>play_arrow</MaterialIconComponent>
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
                <MaterialIconComponent>remove_circle</MaterialIconComponent>
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
                        [styles.Active]: this.state.showTeamMembersList,
                    })}`}
                    onClick={this.onAssignOwnerClick}
                >
                    {this.props.task.owner ? (
                        <UserProfile user={this.props.task.owner} />
                    ) : (
                        <MaterialIconComponent>face</MaterialIconComponent>
                    )}
                </div>
                {this.state.showTeamMembersList && (
                    <div className={styles.TeamMemberList}>
                        <div className={styles.TeamMemberListHeader}>
                            <div
                                className={styles.CloseButton}
                                onClick={this.onCloseTeamMembersListClick}
                            >
                                <MaterialIconComponent>
                                    close
                                </MaterialIconComponent>
                            </div>
                        </div>
                        <SelectUserListComponent
                            users={this.state.potentialOwners}
                            onSelectUser={this.onSelectOwner}
                            findUsers={this.findPotentialOwners}
                        />
                    </div>
                )}
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
                <MaterialIconComponent>settings</MaterialIconComponent>
            </div>
        );
    }

    public render(): ReactElement {
        return (
            <div ref={this.ref} className={styles.Task}>
                <div className={styles.LeftSection}>
                    {this.props.task.id > 0 && (
                        <div className={styles.IdRow}>
                            <span className={styles.Id}>
                                #{this.props.task.id}
                            </span>
                        </div>
                    )}
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
            />
        ) : (
            <div className={styles.Goal}>{this.state.task.goal}</div>
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
                return TaskComponent.renderReportBlocked(index);
            case TaskAction.AssignOwner:
                return this.renderAssignOwner(index);
            case TaskAction.Delete:
                return this.renderDeleteTask(index);
            case TaskAction.ViewDetail:
                return this.renderTaskDetail(index);
        }
    };

    private renderActions(): ReactElement[] {
        let actions = this.state.task.availableActions;
        if (this.props.canViewDetail) {
            actions = actions.concat(TaskAction.ViewDetail);
        }
        return actions.map(this.renderAction);
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

    private onSelectOwner = (userId: number): void => {
        const task = Object.assign({}, this.state.task, {
            owner: {
                id: userId
            }
        });
        this.props.onTaskChanged?.call(this, task);
        this.closeTeamMembersList();
    };

    private finishEditing() {
        this.setState({
            isEditing: false,
        });
        this.props.onTaskFinishEditing?.call(this, this.state.task);
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

    private onAssignOwnerClick = (): void => {
        this.setState({
            showTeamMembersList: true,
        });
    };

    private onCloseTeamMembersListClick = (): void => {
        this.closeTeamMembersList();
    };

    private closeTeamMembersList() {
        this.setState({
            showTeamMembersList: false,
        });
    }

    private findPotentialOwners = async () => {
        if (this.props.findPotentialOwners) {
            const potentialOwners = await this.props.findPotentialOwners(
                this.props.task.id,
            );
            this.setState({
                potentialOwners: potentialOwners,
            });
        }
    };
}
