import React, { Component, createRef, ReactElement } from 'react';
import Task from '../../entity/Task';
import { TaskAction } from '../../entity/TaskAction';
import MaterialIconComponent from '../ui/MaterialIcon.component';
import NamedValueComponent from '../ui/NamedValue.component';
import AssigneeComponent from './Assignee.component';
import styles from './Task.component.module.scss';

export interface OnTaskDetailClick {
    (taskId: number): void;
}

interface IProps {
    task: Task;
    onTaskDetailClick?: OnTaskDetailClick;
}

export default class TaskComponent extends Component<IProps> {
    private ref = createRef<HTMLDivElement>();

    private static renderStartTask(): ReactElement {
        return (
            <span className={styles.StartTaskIcon}>
                <MaterialIconComponent>play_arrow</MaterialIconComponent>
            </span>
        );
    }

    private static renderMarkTaskCompleted(): ReactElement {
        return (
            <span className={styles.TaskCompletedIcon}>
                <MaterialIconComponent>check_circle</MaterialIconComponent>
            </span>
        );
    }

    private static renderReportBlocked(): ReactElement {
        return (
            <span className={styles.MarkTaskBlockIcon}>
                <MaterialIconComponent>report</MaterialIconComponent>
            </span>
        );
    }

    private static renderDeleteTask(): ReactElement {
        return (
            <span className={styles.DeleteTaskIcon}>
                <MaterialIconComponent>remove_circle</MaterialIconComponent>
            </span>
        );
    }

    private static renderAssignOwner(): ReactElement {
        return <AssigneeComponent />;
    }

    public render(): ReactElement {
        return (
            <div ref={this.ref} className={styles.Task}>
                <div className={styles.LeftSection}>
                    <div className={styles.Goal}>{this.props.task.goal}</div>
                    {this.props.task.dueAt && (
                        <div className={styles.DueAt}>
                            Due:{' '}
                            {new Date(this.props.task.dueAt).toLocaleString()}
                        </div>
                    )}
                    <div className={styles.Attributes}>
                        {this.props.task.effort && (
                            <span className={styles.EffortAttribute}>
                                <NamedValueComponent
                                    name={'Effort'}
                                    value={`${this.props.task.effort}`}
                                />
                            </span>
                        )}
                    </div>
                </div>
                {this.props.task.availableActions && (
                    <div className={styles.ActionsSection}>
                        {this.renderActions()}
                    </div>
                )}
            </div>
        );
    }

    private renderTaskDetail(): ReactElement {
        return (
            <span
                className={styles.TaskDetailIcon}
                onClick={this.onTaskDetailClick}
            >
                <MaterialIconComponent>settings</MaterialIconComponent>
            </span>
        );
    }

    private renderAction(action: TaskAction): ReactElement {
        switch (action) {
            case TaskAction.Start:
                return TaskComponent.renderStartTask();
            case TaskAction.MarkComplete:
                return TaskComponent.renderMarkTaskCompleted();
            case TaskAction.ReportBlocked:
                return TaskComponent.renderReportBlocked();
            case TaskAction.AssignOwner:
                return TaskComponent.renderAssignOwner();
            case TaskAction.Delete:
                return TaskComponent.renderDeleteTask();
            case TaskAction.ViewDetail:
                return this.renderTaskDetail();
        }
    }

    private renderActions(): ReactElement[] {
        return this.props.task.availableActions
            .concat(TaskAction.ViewDetail)
            .map((action: TaskAction, index: number) => {
                return (
                    <div className={styles.Action} key={index}>
                        {this.renderAction(action)}
                    </div>
                );
            });
    }

    private onTaskDetailClick = (): void => {
        this.props.onTaskDetailClick?.call(this, this.props.task.id);
    };
}
