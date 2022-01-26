import React, { Component, ReactElement } from 'react';

import { DragAndDropContainer } from '@lib/dragAndDrop/DragAndDropContainer';
import { Draggable } from '@lib/dragAndDrop/Draggable';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { SectionUI } from '@lib/ui/Section';
import { SpacerUI } from '@lib/ui/Spacer';
import { BoundingBoxFinder } from '@lib/ui/position';

import { draggableTask } from '@core/config/draggable';
import {
    deliveredSectionId,
    inProgressSectionId,
    upcomingSectionId,
} from '@core/config/sections';
import * as filters from '@core/data/task.filter';
import { Deps } from '@core/dep/deps';
import { Task } from '@core/entity/task';
import { User } from '@core/entity/user';

import styles from './Kanban.module.scss';
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
        const upcoming = this.props.tasks.filter(upcomingColumnFilter);
        const inProgress = this.props.tasks.filter(inProgressColumnFilter);
        const delivered = this.props.tasks.filter(deliveredColumnFilter);
        return (
            <div className={`${styles.TeamStatus} ${styles.TaskLists}`}>
                <div
                    className={`${styles.TaskListSection} ${styles.UpcomingSection}`}
                >
                    <DragAndDropContainer
                        dragAndDropController={
                            this.props.deps.dragAndDropController
                        }
                        containerId={upcomingSectionId}
                        itemType={draggableTask}
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
                                    this.renderExistingTask(upcomingSectionId),
                                )}
                            </div>
                        </SectionUI>
                    </DragAndDropContainer>
                </div>
                <div
                    className={`${styles.TaskListSection} ${styles.InProgressSection}`}
                >
                    <DragAndDropContainer
                        dragAndDropController={
                            this.props.deps.dragAndDropController
                        }
                        containerId={inProgressSectionId}
                        itemType={draggableTask}
                    >
                        <SectionUI
                            title={'In Progress'}
                            actions={
                                <div
                                    className={`${styles.SectionTopBar} ${styles.InProgress}`}
                                >
                                    <div className={styles.TaskCounter}>
                                        {inProgress.length}
                                    </div>
                                    <SpacerUI />
                                </div>
                            }
                        >
                            <div className={styles.TaskList}>
                                {inProgress.map(
                                    this.renderExistingTask(
                                        inProgressSectionId,
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
                                    this.renderExistingTask(deliveredSectionId),
                                )}
                            </div>
                        </SectionUI>
                    </DragAndDropContainer>
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
                            onTaskFinishEditing={onTaskFinishEditing}
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
}
