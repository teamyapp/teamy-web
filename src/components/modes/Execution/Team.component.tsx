import React, { Component, ReactElement } from 'react';
import Task from '../../../entity/Task';
import TeamStatus from '../../../entity/TeamStatus';
import { User } from '../../../entity/User';
import TaskComponent, {
    OnStartTaskClick,
    OnDeleteTaskClick,
    OnTaskDetailClick,
} from '../../shared/Task.component';
import MaterialIconComponent from '../../ui/MaterialIcon.component';
import SectionComponent from '../../ui/Section.component';
import styles from './Team.component.module.scss';

interface IProps {
    taskAdding?: Task;
    teamStatus: TeamStatus;
    findPotentialOwnersForTask?: (taskId: number) => Promise<User[]>;
    onViewTaskDetailClick?: OnTaskDetailClick;
    onAddClick?: () => void;
    onNewTaskChange?: (task: Task) => void;
    onCreateTask?: (task: Task) => void;
    onUpdateTask?: (task: Task) => void;
    onDeleteTaskClick?: OnDeleteTaskClick;
    onStartTaskClick?: OnStartTaskClick;
}

export default class TeamComponent extends Component<IProps> {
    constructor(props: IProps) {
        super(props);
        this.state = {};
    }

    render(): ReactElement {
        return (
            <div className={`${styles.TeamStatus} ${styles.TaskLists}`}>
                <div
                    className={`${styles.TaskListSection} ${styles.UpcomingSection}`}
                >
                    <SectionComponent
                        title={'Upcoming'}
                        actions={
                            <div className={styles.UpcomingActions}>
                                <div
                                    className={styles.UpcomingAction}
                                    onClick={this.props.onAddClick}
                                >
                                    <MaterialIconComponent>
                                        add
                                    </MaterialIconComponent>
                                </div>
                            </div>
                        }
                    >
                        <div className={styles.TaskList}>
                            {this.props.taskAdding &&
                                this.renderNewTask()(this.props.taskAdding)}
                            {this.props.teamStatus.upcomingTasks.map(
                                this.renderExistingTask(),
                            )}
                        </div>
                    </SectionComponent>
                </div>
                <div
                    className={`${styles.TaskListSection} ${styles.InProgressSection}`}
                >
                    <SectionComponent title={'In Progress'}>
                        <div className={styles.TaskList}>
                            {this.props.teamStatus.inProgressTasks.map(
                                this.renderExistingTask(),
                            )}
                        </div>
                    </SectionComponent>
                </div>
                <div
                    className={`${styles.TaskListSection} ${styles.DeliveredSection}`}
                >
                    <SectionComponent title={'Delivered'}>
                        <div className={styles.TaskList}>
                            {this.props.teamStatus.deliveredTasks.map(
                                this.renderExistingTask(),
                            )}
                        </div>
                    </SectionComponent>
                </div>
            </div>
        );
    }

    private renderNewTask = (): ((task: Task) => ReactElement) => {
        return this.renderTask(
            true,
            false,
            this.props.onCreateTask,
            this.props.onNewTaskChange,
        );
    };

    private renderExistingTask = (): ((task: Task) => ReactElement) => {
        return this.renderTask(false, true, undefined, this.props.onUpdateTask);
    };

    private renderTask = (
        isEditing: boolean,
        canViewDetail: boolean,
        onTaskFinishEditing?: (task: Task) => void,
        onTaskChange?: (task: Task) => void,
    ): ((task: Task) => ReactElement) => {
        return (task: Task) => {
            return (
                <div key={task.id}>
                    <TaskComponent
                        canViewDetail={canViewDetail}
                        task={task}
                        isEditing={isEditing}
                        findPotentialOwners={
                            this.props.findPotentialOwnersForTask
                        }
                        onTaskDetailClick={this.props.onViewTaskDetailClick}
                        onTaskChanged={onTaskChange}
                        onTaskFinishEditing={onTaskFinishEditing}
                        onDeleteTaskClick={this.onDeleteTaskClick}
                        onStartTaskClick={this.onStartTaskClick}
                    />
                </div>
            );
        };
    };

    private onDeleteTaskClick = (taskId: number) => {
        this.props.onDeleteTaskClick?.call(this, taskId);
    };

    private onStartTaskClick = (taskId: number) => {
        this.props.onStartTaskClick?.call(this, taskId);
    };
}
