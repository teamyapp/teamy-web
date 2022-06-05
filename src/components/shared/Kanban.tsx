import React, { Component, ReactNode } from 'react';

import { or } from '@lib/data/filter';
import { BoundingBoxFinder } from '@lib/ui/position';

import * as filters from '@core/data/task.filter';
import { Deps } from '@core/dep/deps';
import { SortOrders } from '@core/entity/sortOrders';
import { Task } from '@core/entity/task';
import { User } from '@core/entity/user';

import styles from './Kanban.module.scss';
import { AwaitingSection } from './TaskListSections/AwaitingSection';
import { DeliveredSection } from './TaskListSections/DeliveredSection';
import { InProgressSection } from './TaskListSections/InProgressSection';
import { UpcomingSection } from './TaskListSections/UpcomingSection';

const upcomingColumnFilter = or(filters.upcoming, filters.paused);
const inProgressColumnFilter = filters.inProgress;
const deliveredColumnFilter = filters.delivered;
const awaitingColumnFilter = filters.awaiting;

interface Props {
    deps: Deps;
    taskAdding?: Task;
    tasks: Task[];
    findPotentialOwnersForTask?: (taskId: number) => Promise<User[]>;
    taskSelectingOwner?: Task;
    sortOrders: SortOrders;
    onViewTaskDetailClick?: (taskId: number) => void;
    onAddClick?: () => void;
    onNewTaskChange?: (task: Task) => void;
    onCreateTask?: (task: Task) => void;
    onUpdateTask?: (task: Task) => void;
    onDeleteTaskClick?: (taskId: number) => void;
    onStartTaskClick?: (taskId: number) => void;
    onCompleteTaskClick?: (taskId: number) => void;
    onShowPotentialTaskOwners?: (
        task: Task,
        findAlignTargetBoundBox: BoundingBoxFinder,
    ) => void;
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
            <div className={`${styles.TeamStatus} ${styles.TaskLists}`}>
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
                        onViewTaskDetailClick={this.props.onViewTaskDetailClick}
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
                    <InProgressSection
                        dragAndDropController={
                            this.props.deps.dragAndDropController
                        }
                        tasks={inProgressTasks}
                        taskSelectingOwner={this.props.taskSelectingOwner}
                        onUpdateTask={this.props.onUpdateTask}
                        onViewTaskDetailClick={this.props.onViewTaskDetailClick}
                        onDeleteTaskClick={this.props.onDeleteTaskClick}
                        onCompleteTaskClick={this.props.onCompleteTaskClick}
                        onShowPotentialTaskOwners={
                            this.props.onShowPotentialTaskOwners
                        }
                    />
                </div>
                <div className={`${styles.TaskListSection}`}>
                    <AwaitingSection
                        dragAndDropController={
                            this.props.deps.dragAndDropController
                        }
                        tasks={awaitingTasks}
                        taskSelectingOwner={this.props.taskSelectingOwner}
                        onUpdateTask={this.props.onUpdateTask}
                        onViewTaskDetailClick={this.props.onViewTaskDetailClick}
                        onDeleteTaskClick={this.props.onDeleteTaskClick}
                        onCompleteTaskClick={this.props.onCompleteTaskClick}
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
            </div>
        );
    }
}
