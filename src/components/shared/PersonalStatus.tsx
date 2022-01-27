import React, { Component, ReactElement } from 'react';

import { and, or } from '@lib/data/filter';
import { DragAndDropContainer } from '@lib/dragAndDrop/DragAndDropContainer';
import { Draggable } from '@lib/dragAndDrop/Draggable';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { SectionUI } from '@lib/ui/Section';
import { SpacerUI } from '@lib/ui/Spacer';
import { BoundingBoxFinder } from '@lib/ui/position';

import {
    draggableTask,
    sectionItemSizeTransformer,
} from '@core/config/draggable';
import {
    deliveredSectionId,
    needAttentionSectionId,
    upcomingSectionId,
} from '@core/config/sections';
import * as filters from '@core/data/task.filter';
import { Deps } from '@core/dep/deps';
import { Task } from '@core/entity/task';
import { getActions } from '@core/entity/taskAction';

import styles from './PersonalStatus.module.scss';
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
        const delivered = this.props.personalTasks.filter(
            deliveredColumnFilter,
        );
        const upcoming = this.props.personalTasks
            .filter(
                upcomingColumnFilter(this.props.needAttentionTask?.id || -1),
            )
            .map(withUpcomingActions);
        return (
            <div className={styles.PersonalStatus}>
                <div
                    className={`${styles.TaskListSection} ${styles.NeedAttentionSection}`}
                >
                    <DragAndDropContainer
                        dragAndDropController={
                            this.props.deps.dragAndDropController
                        }
                        containerId={needAttentionSectionId}
                        itemType={draggableTask}
                        itemSizeTransformer={sectionItemSizeTransformer}
                    >
                        <SectionUI title={'Need Attention'}>
                            {this.props.needAttentionTask &&
                                this.renderExistingTask(needAttentionSectionId)(
                                    this.props.needAttentionTask,
                                )}
                        </SectionUI>
                    </DragAndDropContainer>
                </div>
                <div className={`${styles.TaskLists}`}>
                    <div
                        className={`${styles.TaskListSection} ${styles.UpcomingSection}`}
                    >
                        <DragAndDropContainer
                            dragAndDropController={
                                this.props.deps.dragAndDropController
                            }
                            containerId={upcomingSectionId}
                            itemType={draggableTask}
                            itemSizeTransformer={sectionItemSizeTransformer}
                        >
                            <SectionUI
                                title={'Upcoming'}
                                actions={
                                    <div
                                        className={`${styles.SectionTopBar} ${styles.Upcoming}`}
                                    >
                                        <div className={styles.TaskCounter}>
                                            {upcoming.length}
                                        </div>
                                        <SpacerUI />
                                        <div
                                            className={styles.UpcomingAction}
                                            onClick={this.props.onAddClick}
                                        >
                                            <MaterialIconUI>add</MaterialIconUI>
                                        </div>
                                    </div>
                                }
                            >
                                <div className={styles.TaskList}>
                                    {this.props.taskAdding &&
                                        this.renderNewTask(upcomingSectionId)(
                                            this.props.taskAdding,
                                        )}
                                    {upcoming.map(
                                        this.renderExistingTask(
                                            upcomingSectionId,
                                        ),
                                    )}
                                </div>
                            </SectionUI>
                        </DragAndDropContainer>
                    </div>
                    <div
                        className={`${styles.TaskListSection} ${styles.DeliveredSection}`}
                    >
                        <DragAndDropContainer
                            dragAndDropController={
                                this.props.deps.dragAndDropController
                            }
                            containerId={deliveredSectionId}
                            itemType={draggableTask}
                            itemSizeTransformer={sectionItemSizeTransformer}
                        >
                            <SectionUI
                                title={'Delivered'}
                                actions={
                                    <div
                                        className={`${styles.SectionTopBar} ${styles.Delivered}`}
                                    >
                                        <div className={styles.TaskCounter}>
                                            {delivered.length}
                                        </div>
                                        <SpacerUI />
                                    </div>
                                }
                            >
                                <div className={styles.TaskList}>
                                    {delivered.map(
                                        this.renderExistingTask(
                                            deliveredSectionId,
                                        ),
                                    )}
                                </div>
                            </SectionUI>
                        </DragAndDropContainer>
                    </div>
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
