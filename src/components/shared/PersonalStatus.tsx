import React, { Component, ReactElement } from 'react';

import * as csp from '@lib/csp/csp';
import { And, Or } from '@lib/data/filter';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { SectionUI } from '@lib/ui/Section';

import { Deps } from '@core/dep/deps';
import * as events from '@core/entity/events';
import { IBoundingBoxFinder } from '@core/entity/position';
import { Task } from '@core/entity/task';
import { getActions } from '@core/entity/taskAction';

import { Delivered, InProgress, Upcoming } from '../../data/task.filter';
import styles from './Personal.module.scss';
import { TaskPreviewUI } from './TaskPreview';

const upcomingColumnFilter = (needAttentionTaskId: number | string) => {
    return (t: Task) => {
        return Or<Task>(
            Upcoming,
            And(InProgress, (task: Task) => task.id !== needAttentionTaskId),
        )(t);
    };
};
const deliveredColumnFilter = Delivered;

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
                                <div className={styles.UpcomingActions}>
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
                                {this.props.personalTasks
                                    .filter(
                                        upcomingColumnFilter(
                                            this.props.needAttentionTask?.id ||
                                                -1,
                                        ),
                                    )
                                    .map(withUpcomingActions)
                                    .map(this.renderExistingTask())}
                            </div>
                        </SectionUI>
                    </div>
                    <div
                        className={`${styles.TaskListSection} ${styles.DeliveredSection}`}
                    >
                        <SectionUI title={'Delivered'}>
                            <div className={styles.TaskList}>
                                {this.props.personalTasks
                                    .filter(deliveredColumnFilter)
                                    .map(this.renderExistingTask())}
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

function withUpcomingActions(task: Task): Task {
    if (task.status === 'UPCOMING') {
        return task;
    }
    return Object.assign<any, Task, Partial<Task>>({}, task, {
        availableActions: getActions('UPCOMING'),
    });
}
