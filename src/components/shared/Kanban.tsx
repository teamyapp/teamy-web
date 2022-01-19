import React, { Component, ReactElement } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { SectionUI } from '@lib/ui/Section';

import * as filters from '@core/data/task.filter';
import { IBoundingBoxFinder } from '@core/entity/position';
import { Task } from '@core/entity/task';
import { User } from '@core/entity/user';

import { SpacerUI } from '../../libs/ui/Spacer';
import styles from './Kanban.module.scss';
import { TaskPreviewUI } from './TaskPreview';

const upcomingColumnFilter = filters.upcoming;
const inProgressColumnFilter = filters.inProgress;
const deliveredColumnFilter = filters.delivered;

interface IProps {
    taskAdding?: Task;
    tasks: Task[];
    findPotentialOwnersForTask?: (taskId: number | string) => Promise<User[]>;
    taskSelectingOwner?: Task;
    onViewTaskDetailClick?: (taskId: number | string) => void;
    onAddClick?: () => void;
    onNewTaskChange?: (task: Task) => void;
    onCreateTask?: (task: Task) => void;
    onUpdateTask?: (task: Task) => void;
    onDeleteTaskClick?: (taskId: number | string) => void;
    onStartTaskClick?: (taskId: number | string) => void;
    onCompleteTaskClick?: (taskId: number | string) => void;
    onShowPotentialTaskOwners?: (
        task: Task,
        findAlignTargetBoundBox: IBoundingBoxFinder,
    ) => void;
}

export class KanbanUI extends Component<IProps> {
    constructor(props: IProps) {
        super(props);
        this.state = {};
    }

    render(): ReactElement {
        const upcoming = this.props.tasks.filter(upcomingColumnFilter);
        const inProgress = this.props.tasks.filter(inProgressColumnFilter);
        const delivered = this.props.tasks.filter(deliveredColumnFilter);
        return (
            <div className={`${styles.TeamStatus} ${styles.TaskLists}`}>
                <div
                    className={`${styles.TaskListSection} ${styles.UpcomingSection}`}
                >
                    <SectionUI
                        title={'Upcoming'}
                        actions={
                            <div
                                className={`${styles.SectionTopBar} ${styles.Upcoming}`}
                            >
                                <div className={styles.TaskCounter}>
                                    {upcoming.length}
                                </div>
                                <SpacerUI />
                                <div
                                    className={styles.UpcomingAction}
                                    onClick={this.props.onAddClick}
                                >
                                    <MaterialIconUI>add</MaterialIconUI>
                                </div>
                            </div>
                        }
                    >
                        <div className={styles.TaskList}>
                            {this.props.taskAdding &&
                                this.renderNewTask()(this.props.taskAdding)}
                            {upcoming.map(this.renderExistingTask())}
                        </div>
                    </SectionUI>
                </div>
                <div
                    className={`${styles.TaskListSection} ${styles.InProgressSection}`}
                >
                    <SectionUI
                        title={'In Progress'}
                        actions={
                            <div
                                className={`${styles.SectionTopBar} ${styles.InProgress}`}
                            >
                                <div className={styles.TaskCounter}>
                                    {inProgress.length}
                                </div>
                                <SpacerUI />
                            </div>
                        }
                    >
                        <div className={styles.TaskList}>
                            {inProgress.map(this.renderExistingTask())}
                        </div>
                    </SectionUI>
                </div>
                <div
                    className={`${styles.TaskListSection} ${styles.DeliveredSection}`}
                >
                    <SectionUI
                        title={'Delivered'}
                        actions={
                            <div
                                className={`${styles.SectionTopBar} ${styles.Delivered}`}
                            >
                                <div className={styles.TaskCounter}>
                                    {delivered.length}
                                </div>
                                <SpacerUI />
                            </div>
                        }
                    >
                        <div className={styles.TaskList}>
                            {delivered.map(this.renderExistingTask())}
                        </div>
                    </SectionUI>
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
                    <TaskPreviewUI
                        // multiCaster={this.props.multiCaster}
                        canViewDetail={canViewDetail}
                        task={task}
                        isEditing={isEditing}
                        isOwnerSelected={
                            this.props.taskSelectingOwner?.id === task.id
                        }
                        onTaskDetailClick={this.props.onViewTaskDetailClick}
                        onTaskFinishEditing={onTaskFinishEditing}
                        onDeleteTaskClick={this.props.onDeleteTaskClick}
                        onStartTaskClick={this.props.onStartTaskClick}
                        onCompleteTaskClick={this.props.onCompleteTaskClick}
                        onShowPotentialTaskOwners={
                            this.props.onShowPotentialTaskOwners
                        }
                    />
                </div>
            );
        };
    };
}
