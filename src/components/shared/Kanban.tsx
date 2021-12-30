import React, { Component, ReactElement } from 'react';
import { IBoundingBoxFinder } from '@entity/position';
import { Task } from '@entity/task';
import { TeamStatus } from '@entity/teamStatus';
import { User } from '@entity/user';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { SectionUI } from '@lib/ui/Section';
import styles from './Kanban.module.scss';
import { TaskPreviewUI } from './TaskPreview.component';
import * as csp from '@creatcodebuild/csp';
import * as events from '@entity/events';

interface IProps {
    taskAdding?: Task;
    teamStatus: TeamStatus;
    findPotentialOwnersForTask?: (taskId: number) => Promise<User[]>;
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

export default class KanbanUI extends Component<IProps> {
    constructor(props: IProps) {
        super(props);
        this.state = {};
    }

    render(): ReactElement {
        return (
            <div className={`${styles.TeamStatus} ${styles.TaskLists}`}>
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
                            {this.props.teamStatus.upcomingTasks.map(
                                this.renderExistingTask(),
                            )}
                        </div>
                    </SectionUI>
                </div>
                <div
                    className={`${styles.TaskListSection} ${styles.InProgressSection}`}
                >
                    <SectionUI title={'In Progress'}>
                        <div className={styles.TaskList}>
                            {this.props.teamStatus.inProgressTasks.map(
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
                            {this.props.teamStatus.deliveredTasks.map(
                                this.renderExistingTask(),
                            )}
                        </div>
                    </SectionUI>
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
