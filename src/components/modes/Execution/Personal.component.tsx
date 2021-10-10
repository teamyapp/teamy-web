import React, {Component, createRef, ReactElement} from 'react';
import Task from '../../../entity/Task';
import TaskComponent from '../../shared/Task.component';
import TaskModalComponent from '../../shared/TaskModal.component';
import SectionComponent from '../../ui/Section.component';
import styles from './Personal.component.module.scss';

interface IProps {
    taskNeedAttention?: Task;
    upcomingTasks: Task[];
    deliveredTasks: Task[];
}

export default class PersonalComponent extends Component<IProps> {
    private taskDetailModalRef = createRef<TaskModalComponent>();

    public render(): ReactElement {
        return (
            <div>
                <div className={styles.NeedAttentionSection}>
                    <SectionComponent title={'Need Attention'}>
                        {this.props.taskNeedAttention && this.renderTask(this.props.taskNeedAttention)}
                    </SectionComponent>
                </div>
                <div className={styles.TaskLists}>
                    <div className={`${styles.TaskListSection} ${styles.UpcomingSection}`}>
                        <SectionComponent title={'Upcoming'}>
                            <div className={styles.TaskList}>
                                {
                                    this.props.upcomingTasks.map(this.renderTask)
                                }
                            </div>
                        </SectionComponent>
                    </div>
                    <div className={`${styles.TaskListSection} ${styles.DeliveredSection}`}>
                        <SectionComponent title={'Delivered'}>
                            <div className={styles.TaskList}>
                                {
                                    this.props.deliveredTasks.map(this.renderTask)
                                }
                            </div>
                        </SectionComponent>
                    </div>
                </div>
                <TaskModalComponent ref={this.taskDetailModalRef}/>
            </div>
        );
    }

    private renderTask = (task: Task): ReactElement => {
        return (
            <div key={task.id}>
                <TaskComponent task={task} onTaskDetailClick={this.onTaskDetailClick}/>
            </div>
        );
    };

    private onTaskDetailClick = (task: Task) => {
        this.taskDetailModalRef.current?.open(task);
    };
}