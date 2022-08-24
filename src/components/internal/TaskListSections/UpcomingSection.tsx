import React, { Component, ReactNode } from 'react';

import { DragAndDropContainer } from '@lib/dragAndDrop/DragAndDropContainer';
import { DragAndDropController } from '@lib/dragAndDrop/DragAndDropController';
import { DropDownList } from '@lib/ui/DropDownList';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { SectionUI } from '@lib/ui/Section';
import { SpacerUI } from '@lib/ui/Spacer';
import { BoundingBoxFinder } from '@lib/ui/position';

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
    orderByEffort,
    orderByPriority,
    orderByUrgency,
    orderByValue,
} from '@core/data/task.order';
import { CreateTaskInput, UpdateTaskInput } from '@core/entity/input';
import { Task } from '@core/entity/task';
import { User } from '@core/entity/user';

import { InlineCreateTaskUI } from '../InlineCreateTask';
import { TaskListItem } from './TaskListItem';
import styles from './UpcomingSection.module.scss';

interface Props {
    dragAndDropController: DragAndDropController<DragAndDropContext>;
    tasks: Task[];
    createTaskDefaultOwner?: User;
    sortOrder?: string;
    selectOwnerTaskId?: number;
    isPersonal?: boolean;
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
    onSelectSortOrder?: (order: string) => void;
}

interface State {
    onEditingNewTask: boolean;
}

export class UpcomingSection extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            onEditingNewTask: false,
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
                    context={{ isPersonal: this.props.isPersonal }}
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
                            {this.state.onEditingNewTask && (
                                <InlineCreateTaskUI
                                    owner={this.props.createTaskDefaultOwner}
                                    onCreateTask={this.onCreateTask}
                                    onDiscardNewTask={this.onDiscardNewTask}
                                />
                            )}
                            {tasks.map(
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
                        dragAndDropController={this.props.dragAndDropController}
                        sectionId={sectionId}
                        task={task}
                        showStatus={true}
                        isSelectingOwner={
                            this.props.selectOwnerTaskId === task.id
                        }
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

    private getSortedTasks(): Task[] {
        switch (this.props.sortOrder) {
            case taskPriorityOrder:
                return this.props.tasks.sort(orderByPriority);
            case taskUrgencyOrder:
                return this.props.tasks.sort(orderByUrgency);
            case taskValueOrder:
                return this.props.tasks.sort(orderByValue);
            case taskEffortOrder:
                return this.props.tasks.sort(orderByEffort);
            default:
                return this.props.tasks;
        }
    }
}
