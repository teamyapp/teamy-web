import React, { Component, ReactElement } from 'react';

import { and, or } from '@lib/data/filter';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { SectionUI } from '@lib/ui/Section';

import { Deps } from '@core/dep/deps';
import { IBoundingBoxFinder } from '@core/entity/position';
import { Task } from '@core/entity/task';
import { getActions } from '@core/entity/taskAction';

import * as filters from '../../data/task.filter';
import { SpacerUI } from '../../libs/ui/Spacer';
import styles from './PersonalStatus.module.scss';
import { TaskPreviewUI } from './TaskPreview';

const upcomingColumnFilter = (needAttentionTaskId: number | string) =>
    or<Task>(
        filters.upcoming,
        and(
            filters.inProgress,
            (task: Task) => task.id !== needAttentionTaskId,
        ),
    );
const deliveredColumnFilter = filters.delivered;

interface IProps {
    deps: Deps;
    taskAdding?: Task;
    needAttentionTask?: Task;
    personalTasks: Task[];
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

export class PersonalStatusUI extends Component<IProps> {
    public render(): ReactElement {
        const delivered = this.props.personalTasks.filter(
            deliveredColumnFilter,
        );
        const upcoming = this.props.personalTasks
            .filter(
                upcomingColumnFilter(this.props.needAttentionTask?.id || -1),
            )
            .map(withUpcomingActions);
        return (
            <div className={styles.PersonalStatus}>
                <div className={styles.NeedAttentionSection}>
                    <SectionUI title={'Need Attention'}>
                        {this.props.needAttentionTask &&
                            this.renderExistingTask()(
                                this.props.needAttentionTask,
                            )}
                    </SectionUI>
                </div>
                <div className={`${styles.TaskLists}`}>
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

function withUpcomingActions(task: Task): Task {
    if (task.status === 'UPCOMING') {
        return task;
    }
    return Object.assign<any, Task, Partial<Task>>({}, task, {
        availableActions: getActions('UPCOMING'),
    });
}
