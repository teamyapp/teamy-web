import React, { Component, ReactElement } from 'react';

import { and, or } from '@lib/data/filter';
import { Draggable } from '@lib/dragAndDrop/Draggable';
import { BoundingBoxFinder } from '@lib/ui/position';

import { draggableTask } from '@core/config/draggable';
import * as filters from '@core/data/task.filter';
import { Deps } from '@core/dep/deps';
import { Task } from '@core/entity/task';
import { getActions } from '@core/entity/taskAction';

import styles from './PersonalStatus.module.scss';
import { DeliveredSection } from './TaskListSections/DeliveredSection';
import { NeedAttentionSection } from './TaskListSections/NeedAttentionSection';
import { UpcomingSection } from './TaskListSections/UpcomingSection';
import { TaskPreviewUI } from './TaskPreview';

const upcomingColumnFilter = (needAttentionTaskId: number | string) =>
    or<Task>(
        filters.upcoming,
        and(
            filters.inProgress,
            (task: Task) => task.id !== needAttentionTaskId,
        ),
    );
const deliveredColumnFilter = filters.delivered;

interface Props {
    deps: Deps;
    taskAdding?: Task;
    needAttentionTask?: Task;
    personalTasks: Task[];
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

export class PersonalStatusUI extends Component<Props> {
    public render(): ReactElement {
        const deliveredTasks = this.props.personalTasks.filter(
            deliveredColumnFilter,
        );
        const upcomingTasks = this.props.personalTasks
            .filter(
                upcomingColumnFilter(this.props.needAttentionTask?.id || -1),
            )
            .map(withUpcomingActions);
        return (
            <div className={styles.PersonalStatus}>
                <div
                    className={`${styles.TaskListSection} ${styles.NeedAttentionSection}`}
                >
                    <NeedAttentionSection
                        dragAndDropController={
                            this.props.deps.dragAndDropController
                        }
                        needAttentionTask={this.props.needAttentionTask}
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
                <div className={`${styles.TaskLists}`}>
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
                            onViewTaskDetailClick={
                                this.props.onViewTaskDetailClick
                            }
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
                            onViewTaskDetailClick={
                                this.props.onViewTaskDetailClick
                            }
                            onDeleteTaskClick={this.props.onDeleteTaskClick}
                            onStartTaskClick={this.props.onStartTaskClick}
                            onCompleteTaskClick={this.props.onCompleteTaskClick}
                            onShowPotentialTaskOwners={
                                this.props.onShowPotentialTaskOwners
                            }
                        />
                    </div>
                </div>
            </div>
        );
    }

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
        const taskFinishEditing = (task: Task) => {
            this.props.deps.dragAndDropController.turnOnDragging(draggableTask);
            onTaskFinishEditing?.call(null, task);
        };
        return (task: Task) => {
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

function withUpcomingActions(task: Task): Task {
    if (task.status === 'UPCOMING') {
        return task;
    }
    return Object.assign<any, Task, Partial<Task>>({}, task, {
        availableActions: getActions('UPCOMING'),
    });
}
