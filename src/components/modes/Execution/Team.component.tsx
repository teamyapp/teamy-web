import React, { Component, ReactElement } from 'react';
import Task from '../../../entity/Task';
import TeamStatus from '../../../entity/TeamStatus';
import TaskComponent, { OnTaskDetailClick } from '../../shared/Task.component';
import MaterialIconComponent from '../../ui/MaterialIcon.component';
import SectionComponent from '../../ui/Section.component';
import styles from './Team.component.module.scss';

interface IProps {
    taskAdding?: Task;
    teamStatus: TeamStatus;
    onViewTaskDetailClick?: OnTaskDetailClick;
    onAddClick?: () => void;
    onNewTaskChange?: (task: Task) => void;
    onCreateTask?: (task: Task) => void;
    onUpdateTask?: (task: Task) => void;
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
            this.props.onCreateTask,
            this.props.onNewTaskChange,
        );
    };

    private renderExistingTask = (): ((task: Task) => ReactElement) => {
        return this.renderTask(false, this.props.onUpdateTask);
    };

    private renderTask = (
        isEditing: boolean,
        onTaskFinishEditing?: (task: Task) => void,
        onTaskChange?: (task: Task) => void,
    ): ((task: Task) => ReactElement) => {
        return (task: Task) => {
            return (
                <div key={task.id}>
                    <TaskComponent
                        task={task}
                        isEditing={isEditing}
                        onTaskDetailClick={this.props.onViewTaskDetailClick}
                        onTaskChanged={onTaskChange}
                        onTaskFinishEditing={onTaskFinishEditing}
                    />
                </div>
            );
        };
    };
}
