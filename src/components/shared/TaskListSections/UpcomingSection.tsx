import React, { Component, ReactNode } from 'react';

import { DragAndDropContainer } from '@lib/dragAndDrop/DragAndDropContainer';
import { DragAndDropController } from '@lib/dragAndDrop/DragAndDropController';
import { DropDownList } from '@lib/ui/DropDownList';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { SectionUI } from '@lib/ui/Section';
import { SpacerUI } from '@lib/ui/Spacer';
import { BoundingBoxFinder } from '@lib/ui/position';

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
    orderByEffort,
    orderByPriority,
    orderByUrgency,
    orderByValue,
} from '@core/data/task.order';
import { Task } from '@core/entity/task';

import { TaskListItem } from './TaskListItem';
import styles from './UpcomingSection.module.scss';

interface Props {
    dragAndDropController: DragAndDropController;
    tasks: Task[];
    taskAdding?: Task;
    taskSelectingOwner?: Task;
    sortOrder?: string;
    onAddClick?: () => void;
    onCreateTask?: (task: Task) => void;
    onUpdateTask?: (task: Task) => void;
    onViewTaskDetailClick?: (taskId: string) => void;
    onDeleteTaskClick?: (taskId: string) => void;
    onStartTaskClick?: (taskId: string) => void;
    onCompleteTaskClick?: (taskId: string) => void;
    onShowPotentialTaskOwners?: (
        task: Task,
        findAlignTargetBoundBox: BoundingBoxFinder,
    ) => void;
    onSelectSortOrder?: (order: string) => void;
}

export class UpcomingSection extends Component<Props> {
    public render() {
        const tasks = this.getSortedTasks();
        return (
            <div className={styles.TaskListSection}>
                <DragAndDropContainer
                    dragAndDropController={this.props.dragAndDropController}
                    containerId={upcomingSectionId}
                    itemType={draggableTask}
                    itemSizeTransformer={sectionItemSizeTransformer}
                >
                    <SectionUI
                        title={'Upcoming'}
                        actions={
                            <div className={`${styles.SectionTopBar}`}>
                                <div className={styles.TaskCounter}>
                                    {tasks.length}
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
                                    onClick={this.props.onAddClick}
                                >
                                    <MaterialIconUI>add</MaterialIconUI>
                                </div>
                            </div>
                        }
                    >
                        <div className={styles.TaskList}>
                            {this.props.taskAdding &&
                                this.renderTaskListItemNewTask(
                                    upcomingSectionId,
                                )(this.props.taskAdding)}
                            {tasks.map(
                                this.renderTaskListItemExistingTask(
                                    upcomingSectionId,
                                ),
                            )}
                        </div>
                    </SectionUI>
                </DragAndDropContainer>
            </div>
        );
    }

    private renderTaskListItemNewTask = (
        sectionId: string,
    ): ((task: Task) => ReactNode) => {
        return this.renderTask(sectionId, true, false, this.props.onCreateTask);
    };

    private renderTaskListItemExistingTask = (
        sectionId: string,
    ): ((task: Task) => ReactNode) => {
        return this.renderTask(sectionId, false, true, this.props.onUpdateTask);
    };

    private renderTask = (
        sectionId: string,
        isEditing: boolean,
        canViewDetail: boolean,
        onTaskFinishEditing?: (task: Task) => void,
    ): ((task: Task) => ReactNode) => {
        return (task: Task) => {
            return (
                <div key={task.id}>
                    <TaskListItem
                        dragAndDropController={this.props.dragAndDropController}
                        task={task}
                        sectionId={sectionId}
                        isEditing={isEditing}
                        canViewDetail={canViewDetail}
                        taskSelectingOwner={this.props.taskSelectingOwner}
                        onTaskFinishEditing={onTaskFinishEditing}
                        onViewTaskDetailClick={this.props.onViewTaskDetailClick}
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

    private getSortedTasks(): Task[] {
        switch (this.props.sortOrder) {
            case taskPriorityOrder:
                return orderByPriority(this.props.tasks);
            case taskUrgencyOrder:
                return orderByUrgency(this.props.tasks);
            case taskValueOrder:
                return orderByValue(this.props.tasks);
            case taskEffortOrder:
                return orderByEffort(this.props.tasks);
            default:
                return this.props.tasks;
        }
    }
}
