import React, { Component, ReactElement } from 'react';
import PersonalStatus from '../../../entity/PersonalStatus';
import Task from '../../../entity/Task';
import TaskComponent, { OnTaskDetailClick } from '../../shared/Task.component';
import SectionComponent from '../../ui/Section.component';
import styles from './Personal.component.module.scss';

interface IProps {
    personalStatus: PersonalStatus;
    onViewTaskDetailClick?: OnTaskDetailClick;
}

export default class PersonalComponent extends Component<IProps> {
    public render(): ReactElement {
        return (
            <div className={styles.PersonalStatus}>
                <div className={styles.NeedAttentionSection}>
                    <SectionComponent title={'Need Attention'}>
                        {this.props.personalStatus.taskNeedAttention &&
                            this.renderTask(
                                this.props.personalStatus.taskNeedAttention,
                            )}
                    </SectionComponent>
                </div>
                <div className={`${styles.TaskLists}`}>
                    <div
                        className={`${styles.TaskListSection} ${styles.UpcomingSection}`}
                    >
                        <SectionComponent title={'Upcoming'}>
                            <div className={styles.TaskList}>
                                {this.props.personalStatus.upcomingTasks.map(
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
                                {this.props.personalStatus.deliveredTasks.map(
                                    this.renderTask,
                                )}
                            </div>
                        </SectionComponent>
                    </div>
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
