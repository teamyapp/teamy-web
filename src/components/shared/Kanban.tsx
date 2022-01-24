import classNames from 'classnames';
import React, { Component, DragEvent, ReactElement } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { SectionUI } from '@lib/ui/Section';
import { SpacerUI } from '@lib/ui/Spacer';

import * as filters from '@core/data/task.filter';
import { IBoundingBoxFinder } from '@core/entity/position';
import { Task } from '@core/entity/task';
import { User } from '@core/entity/user';

import {
    deliveredSectionId,
    inProgressSectionId,
    upcomingSectionId,
} from '../sections';
import styles from './Kanban.module.scss';
import { TaskPreviewUI } from './TaskPreview';

const upcomingColumnFilter = filters.upcoming;
const inProgressColumnFilter = filters.inProgress;
const deliveredColumnFilter = filters.delivered;

interface IProps {
    receivingSectionId?: string;
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
        findAlignTargetBoundBox: IBoundingBoxFinder,
    ) => void;
    onDragTaskStart?: (sectionId: string, taskId: string) => void;
    onDropTask?: (sectionId: string) => void;
    onDragEnterSection?: (sectionId: string) => void;
    onDragLeaveSection?: (sectionId: string) => void;
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
                    className={`${styles.TaskListSection} ${
                        styles.UpcomingSection
                    } ${classNames({
                        [styles.isReceiving]:
                            this.props.receivingSectionId === upcomingSectionId,
                    })}`}
                    onDragEnter={this.onDragEnterSection(upcomingSectionId)}
                    onDragLeave={this.onDragLeaveSection(upcomingSectionId)}
                    onDragOver={onDragOverSection}
                    onDrop={this.onDropTask(upcomingSectionId)}
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
                </div>
                <div
                    className={`${styles.TaskListSection} ${
                        styles.InProgressSection
                    } ${classNames({
                        [styles.isReceiving]:
                            this.props.receivingSectionId ===
                            inProgressSectionId,
                    })}`}
                    onDragEnter={this.onDragEnterSection(inProgressSectionId)}
                    onDragLeave={this.onDragLeaveSection(inProgressSectionId)}
                    onDragOver={onDragOverSection}
                    onDrop={this.onDropTask(inProgressSectionId)}
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
                                this.renderExistingTask(inProgressSectionId),
                            )}
                        </div>
                    </SectionUI>
                </div>
                <div
                    className={`${styles.TaskListSection} ${
                        styles.DeliveredSection
                    } ${classNames({
                        [styles.isReceiving]:
                            this.props.receivingSectionId ===
                            deliveredSectionId,
                    })}`}
                    onDragEnter={this.onDragEnterSection(deliveredSectionId)}
                    onDragLeave={this.onDragLeaveSection(deliveredSectionId)}
                    onDragOver={onDragOverSection}
                    onDrop={this.onDropTask(deliveredSectionId)}
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
                <div
                    key={task.id}
                    draggable={true}
                    onDragStart={this.onDragTaskStart(sectionId, task.id)}
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
                </div>
            );
        };
    };

    private onDragTaskStart(sectionId: string, taskId: string) {
        return () => {
            this.props.onDragTaskStart?.call(null, sectionId, taskId);
        };
    }

    private onDragEnterSection(sectionId: string) {
        return () => {
            this.props.onDragEnterSection?.call(null, sectionId);
        };
    }

    private onDragLeaveSection(sectionId: string) {
        return () => {
            this.props.onDragLeaveSection?.call(null, sectionId);
        };
    }

    private onDropTask(sectionId: string) {
        return () => {
            this.props.onDropTask?.call(null, sectionId);
        };
    }
}

function onDragOverSection(event: DragEvent) {
    event.preventDefault();
}
