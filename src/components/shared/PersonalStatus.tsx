import React, { Component, ReactElement } from 'react';
import { Deps } from '@deps';
import { PersonalStatus } from '@entity/personalStatus';
import { IBoundingBoxFinder } from '@entity/position';
import { Task } from '@entity/task';
import { MaterialIconUI } from '@ui/MaterialIcon';
import { SectionUI } from '@ui/Section';
import styles from './Personal.module.scss';
import { TaskPreviewUI } from './TaskPreview.component';
import * as csp from '@creatcodebuild/csp';
import * as events from '@entity/events';

interface IProps {
    deps: Deps;
    taskAdding?: Task;
    personalStatus: PersonalStatus;
    taskSelectingOwner?: Task;
    multiCaster: csp.Multicaster<events.MutationEvent>;
    onViewTaskDetailClick?: (taskId: number) => void;
    onAddClick?: () => void;
    onNewTaskChange?: (task: Task) => void;
    onCreateTask?: (task: Task) => void;
    onUpdateTask?: (task: Task) => void;
    onDeleteTaskClick?: (taskId: number) => void;
    onStartTaskClick?: (taskId: number) => void;
    onCompleteTaskClick?: (taskId: number) => void;
    onShowPotentialTaskOwners?: (
        task: Task,
        findAlignTargetBoundBox: IBoundingBoxFinder,
    ) => void;
}

export default class PersonalStatusUI extends Component<IProps> {
    constructor(props: IProps) {
        super(props);
        this.state = {};
    }

    public render(): ReactElement {
        return (
            <div className={styles.PersonalStatus}>
                <div className={styles.NeedAttentionSection}>
                    <SectionUI title={'Need Attention'}>
                        {this.props.personalStatus.needAttentionTask &&
                            this.renderExistingTask()(
                                this.props.personalStatus.needAttentionTask,
                            )}
                    </SectionUI>
                </div>
                <div className={`${styles.TaskLists}`}>
                    <div
                        className={`${styles.TaskListSection} ${styles.UpcomingSection}`}
                    >
                        <SectionUI
                            title={'Upcoming'}
                            actions={
                                <div className={styles.UpcomingActions}>
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
                                    this.renderNewTask()(this.props.taskAdding)}
                                {this.props.personalStatus.upcomingTasks.map(
                                    this.renderExistingTask(),
                                )}
                            </div>
                        </SectionUI>
                    </div>
                    <div
                        className={`${styles.TaskListSection} ${styles.DeliveredSection}`}
                    >
                        <SectionUI title={'Delivered'}>
                            <div className={styles.TaskList}>
                                {this.props.personalStatus.deliveredTasks.map(
                                    this.renderExistingTask(),
                                )}
                            </div>
                        </SectionUI>
                    </div>
                </div>
            </div>
        );
    }

    private renderNewTask = (): ((task: Task) => ReactElement) => {
        return this.renderTask(true, false, this.props.onCreateTask);
    };

    private renderExistingTask = (): ((task: Task) => ReactElement) => {
        return this.renderTask(false, true, this.props.onUpdateTask);
    };

    private renderTask = (
        isEditing: boolean,
        canViewDetail: boolean,
        onTaskFinishEditing?: (task: Task) => void,
    ): ((task: Task) => ReactElement) => {
        return (task: Task) => {
            return (
                <div key={task.id}>
                    <TaskPreviewUI
                        multiCaster={this.props.multiCaster}
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
}
