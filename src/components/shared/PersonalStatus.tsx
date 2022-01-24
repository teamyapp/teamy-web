import classNames from 'classnames';
import React, { Component, DragEvent, ReactElement } from 'react';

import { and, or } from '@lib/data/filter';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { SectionUI } from '@lib/ui/Section';
import { SpacerUI } from '@lib/ui/Spacer';

import * as filters from '@core/data/task.filter';
import { Deps } from '@core/dep/deps';
import { IBoundingBoxFinder } from '@core/entity/position';
import { Task } from '@core/entity/task';
import { getActions } from '@core/entity/taskAction';

import {
    deliveredSectionId,
    needAttentionSectionId,
    upcomingSectionId,
} from '../sections';
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
    receivingSectionId?: string;
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
        findAlignTargetBoundBox: IBoundingBoxFinder,
    ) => void;
    onDragTaskStart?: (sectionId: string, taskId: string) => void;
    onDropTask?: (sectionId: string) => void;
    onDragEnterSection?: (sectionId: string) => void;
    onDragLeaveSection?: (sectionId: string) => void;
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
                    className={`${styles.TaskListSection} ${
                        styles.NeedAttentionSection
                    } ${classNames({
                        [styles.isReceiving]:
                            this.props.receivingSectionId ===
                            needAttentionSectionId,
                    })}`}
                    onDragEnter={this.onDragEnterSection(
                        needAttentionSectionId,
                    )}
                    onDragLeave={this.onDragLeaveSection(
                        needAttentionSectionId,
                    )}
                    onDragOver={onDragOverSection}
                    onDrop={this.onDropTask(needAttentionSectionId)}
                >
                    <SectionUI title={'Need Attention'}>
                        {this.props.needAttentionTask &&
                            this.renderExistingTask(needAttentionSectionId)(
                                this.props.needAttentionTask,
                            )}
                    </SectionUI>
                </div>
                <div className={`${styles.TaskLists}`}>
                    <div
                        className={`${styles.TaskListSection} ${
                            styles.UpcomingSection
                        } ${classNames({
                            [styles.isReceiving]:
                                this.props.receivingSectionId ===
                                upcomingSectionId,
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
                            styles.DeliveredSection
                        } ${classNames({
                            [styles.isReceiving]:
                                this.props.receivingSectionId ===
                                deliveredSectionId,
                        })}`}
                        onDragEnter={this.onDragEnterSection(
                            deliveredSectionId,
                        )}
                        onDragLeave={this.onDragLeaveSection(
                            deliveredSectionId,
                        )}
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

function withUpcomingActions(task: Task): Task {
    if (task.status === 'UPCOMING') {
        return task;
    }
    return Object.assign<any, Task, Partial<Task>>({}, task, {
        availableActions: getActions('UPCOMING'),
    });
}
