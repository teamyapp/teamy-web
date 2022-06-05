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
import { CreateTaskInput } from '@core/entity/input';
import { Task } from '@core/entity/task';
import { User } from '@core/entity/user';

import { InlineCreateTask } from '../InlineCreateTask';
import { TaskListItem } from './TaskListItem';
import styles from './UpcomingSection.module.scss';

interface Props {
    dragAndDropController: DragAndDropController;
    tasks: Task[];
    createTaskDefaultOwner?: User;
    taskSelectingOwner?: Task;
    sortOrder?: string;
    onCreateTask?: (task: CreateTaskInput) => void;
    onUpdateTask?: (task: Task) => void;
    onViewTaskDetailClick?: (taskId: number) => void;
    onDeleteTaskClick?: (taskId: number) => void;
    onStartTaskClick?: (taskId: number) => void;
    onCompleteTaskClick?: (taskId: number) => void;
    onShowPotentialTaskOwners?: (
        task: Task,
        findAlignTargetBoundBox: BoundingBoxFinder,
    ) => void;
    onSelectSortOrder?: (order: string) => void;
}

interface State {
    editingTask: boolean;
}

export class UpcomingSection extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            editingTask: false,
        };
    }

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
                                    onClick={this.onAddClick}
                                >
                                    <MaterialIconUI>add</MaterialIconUI>
                                </div>
                            </div>
                        }
                    >
                        <div className={styles.TaskList}>
                            {this.state.editingTask && (
                                <InlineCreateTask
                                    owner={this.props.createTaskDefaultOwner}
                                    onCreateTask={this.onCreateTask}
                                    onDiscardCreatingTask={
                                        this.onDiscardCreatingTask
                                    }
                                />
                            )}
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

    private onAddClick = () => {
        this.setState({
            editingTask: true,
        });
    };

    private onCreateTask = (task: CreateTaskInput) => {
        this.props.onCreateTask?.call(null, task);
        this.setState({
            editingTask: false,
        });
    };

    private onDiscardCreatingTask = () => {
        this.setState({
            editingTask: false,
        });
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
