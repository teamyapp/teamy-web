import React, { Component, ReactElement } from 'react';

import { Draggable } from '@lib/dragAndDrop/Draggable';
import { BoundingBoxFinder } from '@lib/ui/position';

import { draggableTask } from '@core/config/draggable';
import * as filters from '@core/data/task.filter';
import { Deps } from '@core/dep/deps';
import { Task } from '@core/entity/task';
import { User } from '@core/entity/user';

import styles from './Kanban.module.scss';
import { DeliveredSection } from './TaskListSections/DeliveredSection';
import { InProgressSection } from './TaskListSections/InProgressSection';
import { UpcomingSection } from './TaskListSections/UpcomingSection';
import { TaskPreviewUI } from './TaskPreview';

const upcomingColumnFilter = filters.upcoming;
const inProgressColumnFilter = filters.inProgress;
const deliveredColumnFilter = filters.delivered;

interface IProps {
    deps: Deps;
    taskAdding?: Task;
    tasks: Task[];
    findPotentialOwnersForTask?: (taskId: string) => Promise<User[]>;
    taskSelectingOwner?: Task;
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
}

export class KanbanUI extends Component<IProps> {
    constructor(props: IProps) {
        super(props);
        this.state = {};
    }

    render(): ReactElement {
        const upcomingTasks = this.props.tasks.filter(upcomingColumnFilter);
        const inProgressTasks = this.props.tasks.filter(inProgressColumnFilter);
        const deliveredTasks = this.props.tasks.filter(deliveredColumnFilter);
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
                        onStartTaskClick={this.props.onStartTaskClick}
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

    private renderNewTask = (
        sectionId: string,
    ): ((task: Task) => ReactElement) => {
        return this.renderTask(sectionId, true, false, this.props.onCreateTask);
    };

    private renderExistingTask = (
        sectionId: string,
    ): ((task: Task) => ReactElement) => {
        return this.renderTask(sectionId, false, true, this.props.onUpdateTask);
    };

    private renderTask = (
        sectionId: string,
        isEditing: boolean,
        canViewDetail: boolean,
        onTaskFinishEditing?: (task: Task) => void,
    ): ((task: Task) => ReactElement) => {
        return (task: Task) => {
            const taskFinishEditing = (task: Task) => {
                this.props.deps.dragAndDropController.turnOnDragging(
                    draggableTask,
                );
                onTaskFinishEditing?.call(null, task);
            };
            return (
                <div key={task.id}>
                    <Draggable
                        dragAndDropController={
                            this.props.deps.dragAndDropController
                        }
                        containerId={sectionId}
                        itemType={draggableTask}
                        data={task}
                    >
                        <TaskPreviewUI
                            canViewDetail={canViewDetail}
                            task={task}
                            isEditing={isEditing}
                            isOwnerSelected={
                                this.props.taskSelectingOwner?.id === task.id
                            }
                            onTaskDetailClick={this.props.onViewTaskDetailClick}
                            onTaskStartEditing={this.onTaskStartEditing}
                            onTaskFinishEditing={taskFinishEditing}
                            onDeleteTaskClick={this.props.onDeleteTaskClick}
                            onStartTaskClick={this.props.onStartTaskClick}
                            onCompleteTaskClick={this.props.onCompleteTaskClick}
                            onShowPotentialTaskOwners={
                                this.props.onShowPotentialTaskOwners
                            }
                        />
                    </Draggable>
                </div>
            );
        };
    };

    private onTaskStartEditing = (taskId: string) => {
        this.props.deps.dragAndDropController.turnOffDragging(draggableTask);
    };
}
