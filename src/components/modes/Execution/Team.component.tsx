import React, { Component, ReactElement } from 'react';
import Task from '../../../entity/Task';
import TeamStatus from '../../../entity/TeamStatus';
import TaskComponent, { OnTaskDetailClick } from '../../shared/Task.component';
import SectionComponent from '../../ui/Section.component';
import styles from './Team.component.module.scss';

interface IProps {
    teamStatus: TeamStatus;
    onViewTaskDetailClick?: OnTaskDetailClick;
}

export default class TeamComponent extends Component<IProps> {
    render(): ReactElement {
        return (
            <div className={`${styles.TeamStatus} ${styles.TaskLists}`}>
                <div
                    className={`${styles.TaskListSection} ${styles.UpcomingSection}`}
                >
                    <SectionComponent title={'Upcoming'}>
                        <div className={styles.TaskList}>
                            {this.props.teamStatus.upcomingTasks.map(
                                this.renderTask,
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
                                this.renderTask,
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
                                this.renderTask,
                            )}
                        </div>
                    </SectionComponent>
                </div>
            </div>
        );
    }

    private renderTask = (task: Task): ReactElement => {
        return (
            <div key={task.id}>
                <TaskComponent
                    task={task}
                    onTaskDetailClick={this.onTaskDetailClick}
                />
            </div>
        );
    };

    private onTaskDetailClick = (taskId: number) => {
        if (this.props.onViewTaskDetailClick) {
            this.props.onViewTaskDetailClick(taskId);
        }
    };
}
