import React, { Component, ReactNode } from 'react';

import { SortOrder } from '@lib/data/order';
import { DragAndDropContainer } from '@lib/dragAndDrop/DragAndDropContainer';
import { DragAndDropController } from '@lib/dragAndDrop/DragAndDropController';
import { RelativeLayout } from '@lib/layout/relativeLayout';
import { DropDownList } from '@lib/ui/DropDownList';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { SectionUI } from '@lib/ui/Section';
import { SpacerUI } from '@lib/ui/Spacer';

import { DragAndDropContext } from '@core/config/dragAndDrop';
import {
    draggableTask,
    sectionItemSizeTransformer,
} from '@core/config/draggable';
import { upcomingSectionId } from '@core/config/sections';
import {
    taskEffortOrder,
    taskPriorityOrder,
    taskUrgencyOrder,
    taskValueOrder,
    upcomingSortOrders,
} from '@core/config/sortOrder';
import {
    flattenGroupedTasksByOwner,
    groupByOwners,
} from '@core/data/task.group';
import {
    orderByEffort,
    orderById,
    orderByPriorityDesc,
    orderByUrgency,
    orderByValue,
} from '@core/data/task.order';
import { Deps } from '@core/dep/deps';
import { CreateTaskInput, UpdateTaskInput } from '@core/entity/input';
import { Task } from '@core/entity/task';
import { LocalStore } from '@core/storage/syncer/localStore';

import { InlineCreateTaskUI } from '../InlineCreateTask';
import { TaskListItem } from './TaskListItem';
import styles from './UpcomingSection.module.scss';

interface Props {
    deps: Deps;
    relativeLayout: RelativeLayout;
    dragAndDropController: DragAndDropController<DragAndDropContext>;
    tasks: Task[];
    sortOrder?: string;
    currentClientId?: number;
    isPersonal?: boolean;
    onCreateTask?: (task: CreateTaskInput) => void;
    onUpdateTask?: (taskId: number, task: UpdateTaskInput) => void;
    onStartTask?: (taskId: number) => void;
    onDeleteTask?: (taskId: number) => void;
    onCompleteTask?: (taskId: number) => void;
    onViewTaskDetail?: (taskId: number) => void;
    onReportTaskBlocked?: (taskId: number) => void;
    onSelectSortOrder?: (order: string) => void;
}

interface State {
    onEditingNewTask: boolean;
}

export class UpcomingSection extends Component<Props, State> {
    private readonly localStore: LocalStore;

    constructor(props: Props) {
        super(props);
        this.localStore = props.deps.localStore;
        this.state = {
            onEditingNewTask: false,
        };
    }

    public render() {
        const sortOrder = this.getSortOrder();
        const sortedTasks = this.props.tasks.sort(sortOrder);
        const initialTaskOwnerId = this.props.isPersonal
            ? this.localStore.getState().currUserId
            : undefined;
        return (
            <div className={styles.TaskListSection}>
                <DragAndDropContainer
                    dragAndDropController={this.props.dragAndDropController}
                    containerId={upcomingSectionId}
                    itemType={draggableTask}
                    itemSizeTransformer={sectionItemSizeTransformer}
                    context={{ isPersonal: this.props.isPersonal }}
                >
                    <SectionUI
                        title={'Upcoming'}
                        actions={
                            <div className={`${styles.SectionTopBar}`}>
                                <div className={styles.TaskCounter}>
                                    {sortedTasks.length}
                                </div>
                                <div className={styles.SortOrder}>
                                    <DropDownList
                                        selectOptionKey={this.props.sortOrder}
                                        options={upcomingSortOrders}
                                        onSelectOption={
                                            this.props.onSelectSortOrder
                                        }
                                    />
                                </div>
                                <SpacerUI />
                                <div
                                    className={styles.Actions}
                                    onClick={this.onAddClick}
                                >
                                    <MaterialIconUI>add</MaterialIconUI>
                                </div>
                            </div>
                        }
                    >
                        <div className={styles.TaskList}>
                            {this.state.onEditingNewTask && (
                                <InlineCreateTaskUI
                                    deps={this.props.deps}
                                    initialTaskOwnerId={initialTaskOwnerId}
                                    onCreateTask={this.onCreateTask}
                                    onDiscardNewTask={this.onDiscardNewTask}
                                />
                            )}
                            {sortedTasks.map(
                                this.renderInlineTask(upcomingSectionId),
                            )}
                        </div>
                    </SectionUI>
                </DragAndDropContainer>
            </div>
        );
    }

    private renderInlineTask = (
        sectionId: string,
    ): ((task: Task) => ReactNode) => {
        return (task: Task) => {
            return (
                <div key={task.id}>
                    <TaskListItem
                        deps={this.props.deps}
                        relativeLayout={this.props.relativeLayout}
                        dragAndDropController={this.props.dragAndDropController}
                        sectionId={sectionId}
                        task={task}
                        showStatus={true}
                        currentClientId={this.props.currentClientId}
                        onUpdateTask={this.props.onUpdateTask}
                        onStartTask={this.props.onStartTask}
                        onDeleteTask={this.props.onDeleteTask}
                        onCompleteTask={this.props.onCompleteTask}
                        onViewTaskDetail={this.props.onViewTaskDetail}
                        onReportTaskBlocked={this.props.onReportTaskBlocked}
                    />
                </div>
            );
        };
    };

    private onAddClick = () => {
        this.setState({
            onEditingNewTask: true,
        });
    };

    private onCreateTask = (task: CreateTaskInput) => {
        this.props.onCreateTask?.call(null, task);
        this.setState({
            onEditingNewTask: false,
        });
    };

    private onDiscardNewTask = () => {
        this.setState({
            onEditingNewTask: false,
        });
    };

    private getGroupedTasks(): Map<number | undefined, Task[]> {
        const groupedTasks = groupByOwners(this.props.tasks);
        const newGroupedTasks = new Map<number | undefined, Task[]>();
        const sortOrder = this.getSortOrder();
        groupedTasks.forEach((tasks, group) => {
            newGroupedTasks.set(group, tasks.sort(sortOrder));
        });
        return newGroupedTasks;
    }

    private getSortOrder(): SortOrder<Task> {
        switch (this.props.sortOrder) {
            case taskPriorityOrder:
                return orderByPriorityDesc;
            case taskUrgencyOrder:
                return orderByUrgency;
            case taskValueOrder:
                return orderByValue;
            case taskEffortOrder:
                return orderByEffort;
            default:
                return orderById;
        }
    }
}
