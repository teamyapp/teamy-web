import React, { Component, ReactNode } from 'react';

import { and, or } from '@lib/data/filter';
import { BoundingBoxFinder } from '@lib/ui/position';

import * as filters from '@core/data/task.filter';
import { Deps } from '@core/dep/deps';
import { SortOrders } from '@core/entity/sortOrders';
import { Task } from '@core/entity/task';
import { getActions } from '@core/entity/taskAction';

import styles from './PersonalStatus.module.scss';
import { DeliveredSection } from './TaskListSections/DeliveredSection';
import { NeedAttentionSection } from './TaskListSections/NeedAttentionSection';
import { UpcomingSection } from './TaskListSections/UpcomingSection';

const upcomingColumnFilter = (needAttentionTaskId: number | string) =>
    or<Task>(
        filters.upcoming,
        and(
            filters.inProgress,
            (task: Task) => task.id !== needAttentionTaskId,
        ),
    );
const deliveredColumnFilter = filters.delivered;

interface Props {
    deps: Deps;
    taskAdding?: Task;
    needAttentionTask?: Task;
    personalTasks: Task[];
    taskSelectingOwner?: Task;
    sortOrders: SortOrders;
    onViewTaskDetailClick?: (taskId: string) => void;
    onAddClick?: () => void;
    onNewTaskChange?: (task: Task) => void;
    onCreateTask?: (task: Task) => void;
    onUpdateTask?: (task: Task) => void;
    onDeleteTaskClick?: (taskId: string) => void;
    onStartTaskClick?: (taskId: string) => void;
    onCompleteTaskClick?: (taskId: string) => void;
    onShowPotentialTaskOwners?: (
        task: Task,
        findAlignTargetBoundBox: BoundingBoxFinder,
    ) => void;
    onSelectUpcomingOrder?: (order: string) => void;
}

export class PersonalStatusUI extends Component<Props> {
    public render(): ReactNode {
        const deliveredTasks = this.props.personalTasks.filter(
            deliveredColumnFilter,
        );
        const upcomingTasks = this.props.personalTasks
            .filter(
                upcomingColumnFilter(this.props.needAttentionTask?.id || -1),
            )
            .map(withUpcomingActions);
        return (
            <div className={styles.PersonalStatus}>
                <div
                    className={`${styles.TaskListSection} ${styles.NeedAttentionSection}`}
                >
                    <NeedAttentionSection
                        dragAndDropController={
                            this.props.deps.dragAndDropController
                        }
                        needAttentionTask={this.props.needAttentionTask}
                        taskSelectingOwner={this.props.taskSelectingOwner}
                        onUpdateTask={this.props.onUpdateTask}
                        onViewTaskDetailClick={this.props.onViewTaskDetailClick}
                        onDeleteTaskClick={this.props.onDeleteTaskClick}
                        onStartTaskClick={this.props.onStartTaskClick}
                        onCompleteTaskClick={this.props.onCompleteTaskClick}
                        onShowPotentialTaskOwners={
                            this.props.onShowPotentialTaskOwners
                        }
                    />
                </div>
                <div className={`${styles.TaskLists}`}>
                    <div className={`${styles.TaskListSection}`}>
                        <UpcomingSection
                            dragAndDropController={
                                this.props.deps.dragAndDropController
                            }
                            tasks={upcomingTasks}
                            taskAdding={this.props.taskAdding}
                            taskSelectingOwner={this.props.taskSelectingOwner}
                            sortOrder={this.props.sortOrders.upcoming}
                            onAddClick={this.props.onAddClick}
                            onCreateTask={this.props.onCreateTask}
                            onUpdateTask={this.props.onUpdateTask}
                            onViewTaskDetailClick={
                                this.props.onViewTaskDetailClick
                            }
                            onDeleteTaskClick={this.props.onDeleteTaskClick}
                            onStartTaskClick={this.props.onStartTaskClick}
                            onCompleteTaskClick={this.props.onCompleteTaskClick}
                            onShowPotentialTaskOwners={
                                this.props.onShowPotentialTaskOwners
                            }
                            onSelectSortOrder={this.props.onSelectUpcomingOrder}
                        />
                    </div>
                    <div className={`${styles.TaskListSection}`}>
                        <DeliveredSection
                            dragAndDropController={
                                this.props.deps.dragAndDropController
                            }
                            tasks={deliveredTasks}
                            taskSelectingOwner={this.props.taskSelectingOwner}
                            onUpdateTask={this.props.onUpdateTask}
                            onViewTaskDetailClick={
                                this.props.onViewTaskDetailClick
                            }
                            onDeleteTaskClick={this.props.onDeleteTaskClick}
                            onStartTaskClick={this.props.onStartTaskClick}
                            onCompleteTaskClick={this.props.onCompleteTaskClick}
                            onShowPotentialTaskOwners={
                                this.props.onShowPotentialTaskOwners
                            }
                        />
                    </div>
                </div>
            </div>
        );
    }
}

function withUpcomingActions(task: Task): Task {
    if (task.status === 'UPCOMING') {
        return task;
    }
    return Object.assign<any, Task, Partial<Task>>({}, task, {
        availableActions: getActions('UPCOMING'),
    });
}
