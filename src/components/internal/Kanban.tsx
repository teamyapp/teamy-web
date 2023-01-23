import React, { Component, ReactNode } from 'react';

import { or } from '@lib/data/filter';

import * as filters from '@core/data/task.filter';
import { Deps } from '@core/dep/deps';
import { CreateTaskInput, UpdateTaskInput } from '@core/entity/input';
import { SortOrders } from '@core/entity/sortOrders';
import { Task } from '@core/entity/task';
import { User } from '@core/entity/user';

import styles from './Kanban.module.scss';
import { AwaitingSection } from './TaskListSections/AwaitingSection';
import { DeliveredSection } from './TaskListSections/DeliveredSection';
import { InProgressSection } from './TaskListSections/InProgressSection';
import { UpcomingSection } from './TaskListSections/UpcomingSection';

const upcomingColumnFilter = or(filters.todo, filters.paused);
const inProgressColumnFilter = filters.inProgress;
const deliveredColumnFilter = filters.delivered;
const awaitingColumnFilter = filters.awaiting;

interface Props {
    deps: Deps;
    tasks: Task[];
    findPotentialOwnersForTask?: (taskId: number) => Promise<User[]>;
    sortOrders: SortOrders;
    currentClientId?: number;
    onCreateTask?: (task: CreateTaskInput) => void;
    onUpdateTask?: (taskId: number, task: UpdateTaskInput) => void;
    onStartTask?: (taskId: number) => void;
    onDeleteTask?: (taskId: number) => void;
    onCompleteTask?: (taskId: number) => void;
    onViewTaskDetail?: (taskId: number) => void;
    onReportTaskBlocked?: (taskId: number) => void;
    onSelectUpcomingOrder?: (order: string) => void;
}

export class KanbanUI extends Component<Props> {
    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    render(): ReactNode {
        const upcomingTasks = this.props.tasks.filter(upcomingColumnFilter);
        const inProgressTasks = this.props.tasks.filter(inProgressColumnFilter);
        const deliveredTasks = this.props.tasks.filter(deliveredColumnFilter);
        const awaitingTasks = this.props.tasks.filter(awaitingColumnFilter);
        return (
            <div className={styles.TaskLists}>
                <div className={`${styles.TaskListSection}`}>
                    <UpcomingSection
                        deps={this.props.deps}
                        relativeLayout={this.props.deps.relativeLayout}
                        dragAndDropController={
                            this.props.deps.dragAndDropController
                        }
                        currentClientId={this.props.currentClientId}
                        tasks={upcomingTasks}
                        sortOrder={this.props.sortOrders.upcoming}
                        onCreateTask={this.props.onCreateTask}
                        onUpdateTask={this.props.onUpdateTask}
                        onStartTask={this.props.onStartTask}
                        onDeleteTask={this.props.onDeleteTask}
                        onCompleteTask={this.props.onCompleteTask}
                        onViewTaskDetail={this.props.onViewTaskDetail}
                        onReportTaskBlocked={this.props.onReportTaskBlocked}
                        onSelectSortOrder={this.props.onSelectUpcomingOrder}
                    />
                </div>
                <div className={`${styles.TaskListSection}`}>
                    <InProgressSection
                        deps={this.props.deps}
                        relativeLayout={this.props.deps.relativeLayout}
                        dragAndDropController={
                            this.props.deps.dragAndDropController
                        }
                        tasks={inProgressTasks}
                        currentClientId={this.props.currentClientId}
                        onUpdateTask={this.props.onUpdateTask}
                        onStartTask={this.props.onStartTask}
                        onDeleteTask={this.props.onDeleteTask}
                        onCompleteTask={this.props.onCompleteTask}
                        onViewTaskDetail={this.props.onViewTaskDetail}
                        onReportTaskBlocked={this.props.onReportTaskBlocked}
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
                        onUpdateTask={this.props.onUpdateTask}
                        onStartTask={this.props.onStartTask}
                        onDeleteTask={this.props.onDeleteTask}
                        onCompleteTask={this.props.onCompleteTask}
                        onViewTaskDetail={this.props.onViewTaskDetail}
                        onReportTaskBlocked={this.props.onReportTaskBlocked}
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
                    />
                </div>
            </div>
        );
    }
}
