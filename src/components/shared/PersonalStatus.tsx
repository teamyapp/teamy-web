import React, { Component, ReactNode } from 'react';

import { or } from '@lib/data/filter';
import { BoundingBoxFinder } from '@lib/ui/position';

import * as filters from '@core/data/task.filter';
import { Deps } from '@core/dep/deps';
import { CreateTaskInput, UpdateTaskInput } from '@core/entity/input';
import { SortOrders } from '@core/entity/sortOrders';
import { Task } from '@core/entity/task';

import styles from './PersonalStatus.module.scss';
import { AwaitingSection } from './TaskListSections/AwaitingSection';
import { DeliveredSection } from './TaskListSections/DeliveredSection';
import { NeedAttentionSection } from './TaskListSections/NeedAttentionSection';
import { UpcomingSection } from './TaskListSections/UpcomingSection';

const upcomingColumnFilter = or(filters.upcoming, filters.paused);
const deliveredColumnFilter = filters.delivered;
const awaitingColumnFilter = filters.awaiting;
const inProgressColumnFilter = filters.inProgress;

interface Props {
    deps: Deps;
    personalTasks: Task[];
    sortOrders: SortOrders;
    selectOwnerTaskId?: number;
    onCreateTask?: (task: CreateTaskInput) => void;
    onUpdateTask?: (taskId: number, task: UpdateTaskInput) => void;
    onStartTask?: (taskId: number) => void;
    onDeleteTask?: (taskId: number) => void;
    onCompleteTask?: (taskId: number) => void;
    onViewTaskDetail?: (taskId: number) => void;
    onReportTaskBlocked?: (taskId: number) => void;
    onShowPotentialTaskOwners?: (
        taskId: number,
        updateTaskInput: UpdateTaskInput,
        findAlignTargetBoundBox: BoundingBoxFinder,
        selectedOwnerId?: number,
    ) => void;
    onSelectUpcomingOrder?: (order: string) => void;
}

export class PersonalStatusUI extends Component<Props> {
    public render(): ReactNode {
        const deliveredTasks = this.props.personalTasks.filter(
            deliveredColumnFilter,
        );
        const upcomingTasks =
            this.props.personalTasks.filter(upcomingColumnFilter);
        const awaitingTasks =
            this.props.personalTasks.filter(awaitingColumnFilter);
        const needAttentionTask =
            this.props.personalTasks.filter(inProgressColumnFilter)[0];
        return (
            <div className={styles.PersonalStatus}>
                <div
                    className={`${styles.TaskListSection} ${styles.NeedAttentionSection}`}
                >
                    <NeedAttentionSection
                        dragAndDropController={
                            this.props.deps.dragAndDropController
                        }
                        needAttentionTask={needAttentionTask}
                        selectOwnerTaskId={this.props.selectOwnerTaskId}
                        onUpdateTask={this.props.onUpdateTask}
                        onStartTask={this.props.onStartTask}
                        onDeleteTask={this.props.onDeleteTask}
                        onCompleteTask={this.props.onCompleteTask}
                        onViewTaskDetail={this.props.onViewTaskDetail}
                        onReportTaskBlocked={this.props.onReportTaskBlocked}
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
                            createTaskDefaultOwner={this.props.deps.graphSource.currentUser()}
                            tasks={upcomingTasks}
                            selectOwnerTaskId={this.props.selectOwnerTaskId}
                            sortOrder={this.props.sortOrders.upcoming}
                            onCreateTask={this.props.onCreateTask}
                            onUpdateTask={this.props.onUpdateTask}
                            onStartTask={this.props.onStartTask}
                            onDeleteTask={this.props.onDeleteTask}
                            onCompleteTask={this.props.onCompleteTask}
                            onViewTaskDetail={this.props.onViewTaskDetail}
                            onReportTaskBlocked={this.props.onReportTaskBlocked}
                            onShowPotentialTaskOwners={
                                this.props.onShowPotentialTaskOwners
                            }
                            onSelectSortOrder={this.props.onSelectUpcomingOrder}
                        />
                    </div>
                    <div className={`${styles.TaskListSection}`}>
                        <AwaitingSection
                            dragAndDropController={
                                this.props.deps.dragAndDropController
                            }
                            tasks={awaitingTasks}
                            selectOwnerTaskId={this.props.selectOwnerTaskId}
                            onUpdateTask={this.props.onUpdateTask}
                            onStartTask={this.props.onStartTask}
                            onDeleteTask={this.props.onDeleteTask}
                            onCompleteTask={this.props.onCompleteTask}
                            onViewTaskDetail={this.props.onViewTaskDetail}
                            onReportTaskBlocked={this.props.onReportTaskBlocked}
                            onShowPotentialTaskOwners={
                                this.props.onShowPotentialTaskOwners
                            }
                        />
                    </div>
                    <div className={`${styles.TaskListSection}`}>
                        <DeliveredSection
                            dragAndDropController={
                                this.props.deps.dragAndDropController
                            }
                            tasks={deliveredTasks}
                            selectOwnerTaskId={this.props.selectOwnerTaskId}
                            onUpdateTask={this.props.onUpdateTask}
                            onStartTask={this.props.onStartTask}
                            onDeleteTask={this.props.onDeleteTask}
                            onCompleteTask={this.props.onCompleteTask}
                            onViewTaskDetail={this.props.onViewTaskDetail}
                            onReportTaskBlocked={this.props.onReportTaskBlocked}
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
