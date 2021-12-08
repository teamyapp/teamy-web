import React, { Component, ReactElement } from 'react';
import PersonalStatus from '../../../entity/PersonalStatus';
import Task from '../../../entity/Task';
import { User } from '../../../entity/User';
import TaskComponent from '../../shared/Task.component';
import MaterialIconComponent from '../../ui/MaterialIcon.component';
import SectionComponent from '../../ui/Section.component';
import styles from './Personal.component.module.scss';

interface IProps {
    taskAdding?: Task;
    personalStatus: PersonalStatus;
    findPotentialOwnersForTask?: (taskId: number) => Promise<User[]>;
    onViewTaskDetailClick?: (taskId: number) => void;
    onAddClick?: () => void;
    onNewTaskChange?: (task: Task) => void;
    onCreateTask?: (task: Task) => void;
    onUpdateTask?: (task: Task) => void;
    onDeleteTaskClick?: (taskId: number) => void;
    onStartTaskClick?: (taskId: number) => void;
    onCompleteTaskClick?: (taskId: number) => void;
}

export default class PersonalComponent extends Component<IProps> {
    constructor(props: IProps) {
        super(props);
        this.state = {};
    }

    public render(): ReactElement {
        return (
            <div className={styles.PersonalStatus}>
                <div className={styles.NeedAttentionSection}>
                    <SectionComponent title={'Need Attention'}>
                        {this.props.personalStatus.needAttentionTask &&
                            this.renderExistingTask()(
                                this.props.personalStatus.needAttentionTask,
                            )}
                    </SectionComponent>
                </div>
                <div className={`${styles.TaskLists}`}>
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
                                {this.props.personalStatus.upcomingTasks.map(
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
                                {this.props.personalStatus.deliveredTasks.map(
                                    this.renderExistingTask(),
                                )}
                            </div>
                        </SectionComponent>
                    </div>
                </div>
            </div>
        );
    }

    private renderNewTask = (): ((task: Task) => ReactElement) => {
        return this.renderTask(true, false, this.props.onCreateTask);
    };

    private renderExistingTask = (): ((task: Task) => ReactElement) => {
        return this.renderTask(false, true, this.props.onUpdateTask);
    };

    private renderTask = (
        isEditing: boolean,
        canViewDetail: boolean,
        onTaskFinishEditing?: (task: Task) => void,
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
                        onTaskFinishEditing={onTaskFinishEditing}
                        onDeleteTaskClick={this.props.onDeleteTaskClick}
                        onStartTaskClick={this.props.onStartTaskClick}
                        onCompleteTaskClick={this.props.onCompleteTaskClick}
                    />
                </div>
            );
        };
    };
}
