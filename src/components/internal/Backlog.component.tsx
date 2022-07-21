import React, { Component, ReactNode } from 'react';

import * as csp from '@lib/csp/csp';
import { closeIfNot } from '@lib/csp/lib';
import { DragAndDropContainer } from '@lib/dragAndDrop/DragAndDropContainer';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { SpacerUI } from '@lib/ui/Spacer';
import { BoundingBoxFinder } from '@lib/ui/position';

import {
    draggableTask,
    sectionItemSizeTransformer,
} from '@core/config/draggable';
import { backlogSectionId } from '@core/config/sections';
import { unplanned } from '@core/data/task.filter';
import { orderByStatusUrgencyAsc } from '@core/data/task.order';
import { Deps } from '@core/dep/deps';
import { CreateTaskInput, UpdateTaskInput } from '@core/entity/input';
import { Task } from '@core/entity/task';
import { TaskAction } from '@core/entity/taskAction';
import { GraphSource } from '@core/storage/graph/graphSource';
import { LocalStore } from '@core/storage/syncer/localStore';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import styles from './Backlog.component.module.scss';
import { InlineCreateTaskUI } from './InlineCreateTask';
import { TaskListItem } from './TaskListSections/TaskListItem';

interface Props {
    deps: Deps;
    selectOwnerTaskId?: number;
    onViewTaskDetail?: (taskId: number) => void;
    onShowPotentialTaskOwners?: (
        taskId: number,
        updateTaskInput: UpdateTaskInput,
        findAlignTargetBoundBox: BoundingBoxFinder,
        selectedOwnerId?: number,
    ) => void;
}

interface State {
    unplannedTasks: Task[];
    onEditingNewTask: boolean;
}

const shownTaskActions: TaskAction[] = [
    'DELETE',
    'ASSIGN_OWNER',
    'VIEW_DETAIL',
];

export class BacklogComponent extends Component<Props, State> {
    private readonly localStore: LocalStore;
    private readonly graphSource: GraphSource;
    private readonly stateSyncer: StateSyncer;

    private stateChangeChan?: csp.PopChannel<boolean | undefined>;

    constructor(props: Props) {
        super(props);
        this.localStore = props.deps.localStore;
        this.graphSource = props.deps.graphSource;
        this.stateSyncer = props.deps.stateSyncer;
        this.state = {
            unplannedTasks: [],
            onEditingNewTask: false,
        };
    }

    componentDidMount() {
        this.stateChangeChan = this.localStore.subscribeStateChange();
        (async () => {
            while (true) {
                console.log('[AppComponent] waiting for state changes');
                const hasChanged = await this.stateChangeChan!.pop();
                if (hasChanged === undefined) {
                    // check undefined instead of falsy because
                    // a falsy data could be valid data per channel's concern.
                    return;
                }

                this.updateState();
            }
        })().then();
    }

    componentWillUnmount() {
        closeIfNot(this.stateChangeChan);
    }

    render() {
        return (
            <div className={styles.Backlog}>
                <DragAndDropContainer
                    dragAndDropController={
                        this.props.deps.dragAndDropController
                    }
                    containerId={backlogSectionId}
                    itemType={draggableTask}
                    itemSizeTransformer={sectionItemSizeTransformer}
                >
                    <div className={styles.Content}>
                        <div className={styles.Header}>
                            <div className={styles.Title}>Backlog</div>
                            <div className={styles.Counter}>
                                {this.state.unplannedTasks.length}
                            </div>
                            <SpacerUI />
                            <div
                                className={styles.CreateTask}
                                onClick={this.onAddClick}
                            >
                                <MaterialIconUI>add</MaterialIconUI>
                            </div>
                        </div>
                        <div className={styles.TaskList}>
                            {this.state.onEditingNewTask && (
                                <InlineCreateTaskUI
                                    onCreateTask={this.onCreateTask}
                                    onDiscardNewTask={this.onDiscardNewTask}
                                />
                            )}
                            {this.state.unplannedTasks.map(this.renderTask)}
                        </div>
                    </div>
                </DragAndDropContainer>
            </div>
        );
    }

    public async refresh() {
        await this.stateSyncer.pullCurrentTeamTaskPreview({
            isPlanned: false,
        });
    }

    private updateState() {
        let tasks = this.graphSource.currentTeam()?.tasks || [];
        tasks = tasks.filter(unplanned).sort(orderByStatusUrgencyAsc);
        this.setState({
            unplannedTasks: tasks,
        });
    }

    private renderTask = (task: Task, index: number): ReactNode => {
        return (
            <div className={styles.ListItem} key={index}>
                <TaskListItem
                    sectionId={backlogSectionId}
                    dragAndDropController={
                        this.props.deps.dragAndDropController
                    }
                    task={task}
                    numActionColumns={1}
                    showStatus={true}
                    isSelectingOwner={task.id === this.props.selectOwnerTaskId}
                    filterTaskAction={filterTaskAction}
                    onUpdateTask={this.onUpdateTask}
                    onDeleteTask={this.onDeleteTask}
                    onViewTaskDetail={this.props.onViewTaskDetail}
                    onShowPotentialTaskOwners={
                        this.props.onShowPotentialTaskOwners
                    }
                />
            </div>
        );
    };

    private onUpdateTask = async (taskId: number, task: UpdateTaskInput) => {
        await this.stateSyncer.updateTask(taskId, task);
        await this.props.deps.feedbackPubSub.publish({
            type: 'TaskUpdated',
            taskId: taskId,
        });
    };

    private onDeleteTask = (taskId: number): void => {
        this.stateSyncer.deleteTask(taskId);
    };

    private onAddClick = () => {
        this.setState({
            onEditingNewTask: true,
        });
    };

    private onCreateTask = (task: CreateTaskInput) => {
        this.stateSyncer.createTask(
            this.localStore.getState().currTeamId!,
            task,
        );
        this.setState({
            onEditingNewTask: false,
        });
    };

    private onDiscardNewTask = () => {
        this.setState({
            onEditingNewTask: false,
        });
    };
}

function filterTaskAction(action: TaskAction): boolean {
    return shownTaskActions.includes(action);
}
