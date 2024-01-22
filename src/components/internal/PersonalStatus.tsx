import { ThirdPartyAppEventHub } from '@teamyapp/ext';
import React, { Component, ReactNode } from 'react';

import { or } from '@lib/data/filter';

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
    currentClientId?: number;
    thirdPartyAppEventHubs: ThirdPartyAppEventHub[];
    onCreateTask?: (task: CreateTaskInput) => void;
    onUpdateTask?: (taskId: number, task: UpdateTaskInput) => void;
    onStartTask?: (taskId: number) => void;
    onDeleteTask?: (taskId: number) => void;
    onCompleteTask?: (taskId: number) => void;
    onViewTaskDetail?: (taskId: number) => void;
    onReportTaskBlocked?: (taskId: number) => void;
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
                        deps={this.props.deps}
                        relativeLayout={this.props.deps.relativeLayout}
                        dragAndDropController={
                            this.props.deps.dragAndDropController
                        }
                        currentClientId={this.props.currentClientId}
                        needAttentionTask={needAttentionTask}
                        thirdPartyAppEventHubs={
                            this.props.thirdPartyAppEventHubs
                        }
                        onUpdateTask={this.props.onUpdateTask}
                        onStartTask={this.props.onStartTask}
                        onDeleteTask={this.props.onDeleteTask}
                        onCompleteTask={this.props.onCompleteTask}
                        onViewTaskDetail={this.props.onViewTaskDetail}
                        onReportTaskBlocked={this.props.onReportTaskBlocked}
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
                            sortOrder={this.props.sortOrders.upcoming}
                            currentClientId={this.props.currentClientId}
                            thirdPartyAppEventHubs={
                                this.props.thirdPartyAppEventHubs
                            }
                            onCreateTask={this.props.onCreateTask}
                            onUpdateTask={this.props.onUpdateTask}
                            onStartTask={this.props.onStartTask}
                            onDeleteTask={this.props.onDeleteTask}
                            onCompleteTask={this.props.onCompleteTask}
                            onViewTaskDetail={this.props.onViewTaskDetail}
                            onReportTaskBlocked={this.props.onReportTaskBlocked}
                            onSelectSortOrder={this.props.onSelectUpcomingOrder}
                            isPersonal
                        />
                    </div>
                    <div className={`${styles.TaskListSection}`}>
                        <AwaitingSection
                            deps={this.props.deps}
                            relativeLayout={this.props.deps.relativeLayout}
                            dragAndDropController={
                                this.props.deps.dragAndDropController
                            }
                            currentClientId={this.props.currentClientId}
                            tasks={awaitingTasks}
                            thirdPartyAppEventHubs={
                                this.props.thirdPartyAppEventHubs
                            }
                            onUpdateTask={this.props.onUpdateTask}
                            onStartTask={this.props.onStartTask}
                            onDeleteTask={this.props.onDeleteTask}
                            onCompleteTask={this.props.onCompleteTask}
                            onViewTaskDetail={this.props.onViewTaskDetail}
                            onReportTaskBlocked={this.props.onReportTaskBlocked}
                            isPersonal
                        />
                    </div>
                    <div className={`${styles.TaskListSection}`}>
                        <DeliveredSection
                            deps={this.props.deps}
                            relativeLayout={this.props.deps.relativeLayout}
                            dragAndDropController={
                                this.props.deps.dragAndDropController
                            }
                            tasks={deliveredTasks}
                            currentClientId={this.props.currentClientId}
                            onUpdateTask={this.props.onUpdateTask}
                            onStartTask={this.props.onStartTask}
                            onDeleteTask={this.props.onDeleteTask}
                            onCompleteTask={this.props.onCompleteTask}
                            onViewTaskDetail={this.props.onViewTaskDetail}
                            onReportTaskBlocked={this.props.onReportTaskBlocked}
                            isPersonal
                        />
                    </div>
                </div>
            </div>
        );
    }
}
