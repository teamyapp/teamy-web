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

const upcomingColumnFilter = or(filters.todo, filters.paused);
const deliveredColumnFilter = filters.delivered;
const awaitingColumnFilter = filters.awaiting;
const inProgressColumnFilter = filters.inProgress;

interface Props {
    deps: Deps;
    personalTasks: Task[];
    sortOrders: SortOrders;
    selectOwnerTaskId?: number;
    selectedOwnerId?: number;
    currentClientId?: number;
    onCreateTask?: (task: CreateTaskInput) => void;
    onUpdateTask?: (taskId: number, task: UpdateTaskInput) => void;
    onStartTask?: (taskId: number) => void;
    onDeleteTask?: (taskId: number) => void;
    onCompleteTask?: (taskId: number) => void;
    onViewTaskDetail?: (taskId: number) => void;
    onReportTaskBlocked?: (taskId: number) => void;
    onShowPotantialTaskOwnersToUpdateTask?: (
        taskId: number,
        updateTaskInput: UpdateTaskInput,
        findAlignTargetBoundBox: BoundingBoxFinder,
        selectedOwnerId?: number,
    ) => void;
    onShowPotantialTaskOwnersToCreateTask?: (
        findAlignTargetBoundBox: BoundingBoxFinder,
        onClose: () => void,
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
        const needAttentionTask = this.props.personalTasks.filter(
            inProgressColumnFilter,
        )[0];
        return (
            <div className={styles.PersonalStatus}>
                <div
                    className={`${styles.TaskListSection} ${styles.NeedAttentionSection}`}
                >
                    <NeedAttentionSection
                        relativeLayout={this.props.deps.relativeLayout}
                        dragAndDropController={
                            this.props.deps.dragAndDropController
                        }
                        currentClientId={this.props.currentClientId}
                        needAttentionTask={needAttentionTask}
                        selectOwnerTaskId={this.props.selectOwnerTaskId}
                        onUpdateTask={this.props.onUpdateTask}
                        onStartTask={this.props.onStartTask}
                        onDeleteTask={this.props.onDeleteTask}
                        onCompleteTask={this.props.onCompleteTask}
                        onViewTaskDetail={this.props.onViewTaskDetail}
                        onReportTaskBlocked={this.props.onReportTaskBlocked}
                        onShowPotantialTaskOwnersToUpdateTask={
                            this.props.onShowPotantialTaskOwnersToUpdateTask
                        }
                    />
                </div>
                <div className={`${styles.TaskLists}`}>
                    <div className={`${styles.TaskListSection}`}>
                        <UpcomingSection
                            deps={this.props.deps}
                            relativeLayout={this.props.deps.relativeLayout}
                            dragAndDropController={
                                this.props.deps.dragAndDropController
                            }
                            tasks={upcomingTasks}
                            selectOwnerTaskId={this.props.selectOwnerTaskId}
                            selectedOwnerId={this.props.selectedOwnerId}
                            sortOrder={this.props.sortOrders.upcoming}
                            currentClientId={this.props.currentClientId}
                            onCreateTask={this.props.onCreateTask}
                            onUpdateTask={this.props.onUpdateTask}
                            onStartTask={this.props.onStartTask}
                            onDeleteTask={this.props.onDeleteTask}
                            onCompleteTask={this.props.onCompleteTask}
                            onViewTaskDetail={this.props.onViewTaskDetail}
                            onReportTaskBlocked={this.props.onReportTaskBlocked}
                            onShowPotantialTaskOwnersToUpdateTask={
                                this.props.onShowPotantialTaskOwnersToUpdateTask
                            }
                            onShowPotantialTaskOwnersToCreateTask={
                                this.props.onShowPotantialTaskOwnersToCreateTask
                            }
                            onSelectSortOrder={this.props.onSelectUpcomingOrder}
                            isPersonal
                        />
                    </div>
                    <div className={`${styles.TaskListSection}`}>
                        <AwaitingSection
                            relativeLayout={this.props.deps.relativeLayout}
                            dragAndDropController={
                                this.props.deps.dragAndDropController
                            }
                            currentClientId={this.props.currentClientId}
                            tasks={awaitingTasks}
                            selectOwnerTaskId={this.props.selectOwnerTaskId}
                            onUpdateTask={this.props.onUpdateTask}
                            onStartTask={this.props.onStartTask}
                            onDeleteTask={this.props.onDeleteTask}
                            onCompleteTask={this.props.onCompleteTask}
                            onViewTaskDetail={this.props.onViewTaskDetail}
                            onReportTaskBlocked={this.props.onReportTaskBlocked}
                            onShowPotantialTaskOwnersToUpdateTask={
                                this.props.onShowPotantialTaskOwnersToUpdateTask
                            }
                            isPersonal
                        />
                    </div>
                    <div className={`${styles.TaskListSection}`}>
                        <DeliveredSection
                            relativeLayout={this.props.deps.relativeLayout}
                            dragAndDropController={
                                this.props.deps.dragAndDropController
                            }
                            tasks={deliveredTasks}
                            currentClientId={this.props.currentClientId}
                            selectOwnerTaskId={this.props.selectOwnerTaskId}
                            onUpdateTask={this.props.onUpdateTask}
                            onStartTask={this.props.onStartTask}
                            onDeleteTask={this.props.onDeleteTask}
                            onCompleteTask={this.props.onCompleteTask}
                            onViewTaskDetail={this.props.onViewTaskDetail}
                            onReportTaskBlocked={this.props.onReportTaskBlocked}
                            onShowPotantialTaskOwnersToUpdateTask={
                                this.props.onShowPotantialTaskOwnersToUpdateTask
                            }
                            isPersonal
                        />
                    </div>
                </div>
            </div>
        );
    }
}
