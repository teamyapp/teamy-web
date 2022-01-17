import React, { Component, ReactElement, createRef } from 'react';

import * as csp from '@lib/csp/csp';
import { and } from '@lib/data/filter';
import { Route } from '@lib/router/Route';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TabsUI } from '@lib/ui/Tabs';

import * as filters from '@core/data/task.filter';
import { Deps } from '@core/dep/deps';
import { TaskFilters } from '@core/entity/filters';
import { IBoundingBoxFinder } from '@core/entity/position';
import { Task } from '@core/entity/task';
import { TaskAction } from '@core/entity/taskAction';
import { User } from '@core/entity/user';
import { IAppState } from '@core/state/state';

import styles from './Execution.component.module.scss';
import { KanbanUI } from './shared/Kanban';
import { TaskDetailModalComponent } from './shared/Modals/TaskDetailModal.component';
import { PersonalStatusUI } from './shared/PersonalStatus';
import { SelectUserListUI } from './shared/SelectUserList';

const routes = ['/me', '/team'];

const taskOwnersListVerticalOffset = 4;
const taskOwnersListHorizontalOffset = 10;

interface IProps {
    deps: Deps;
}

interface IState {
    showPotentialTaskOwnersList: boolean;
    findTaskOwnersAlignTargetBoundBox?: IBoundingBoxFinder;
    taskOwnersListVisible: boolean;
    taskOwnersListLeft: number;
    taskOwnersListTop: number;
    currentUserId: string;
    needAttentionTask?: Task;
    teamTasks: Task[];
    taskSelectingOwner?: Task;
    potentialTaskOwners: User[];
    taskAdding?: Task;
    taskFilters: TaskFilters;
}

export class ExecutionComponent extends Component<IProps, IState> {
    private readonly taskDetailModalRef = createRef<TaskDetailModalComponent>();
    private readonly taskOwnersPopupRef = createRef<HTMLDivElement>();
    private stateChangeChan?: csp.PopChannel<IAppState | undefined>;

    constructor(props: IProps) {
        super(props);
        this.state = {
            showPotentialTaskOwnersList: false,
            taskOwnersListVisible: false,
            taskOwnersListLeft: 0,
            taskOwnersListTop: 0,
            currentUserId: '-1', // when not logged in yet
            teamTasks: [],
            potentialTaskOwners: [],
            taskFilters: {},
        };
    }

    public render(): ReactElement {
        // TODO: will change when PersonalStatus is merged with Kanban
        let personalTasksFilter = filters.ownedBy(this.state.currentUserId);
        let teamTasksFilter = filters.allTasks;

        if (this.state.taskFilters.timeRangeFilter) {
            personalTasksFilter = and(
                personalTasksFilter,
                this.state.taskFilters.timeRangeFilter,
            );
            teamTasksFilter = and(
                teamTasksFilter,
                this.state.taskFilters.timeRangeFilter,
            );
        }

        if (this.state.taskFilters.taskOwnerFilter) {
            teamTasksFilter = and(
                teamTasksFilter,
                this.state.taskFilters.taskOwnerFilter,
            );
        }

        if (this.state.taskFilters.keywordFilter) {
            personalTasksFilter = and(
                personalTasksFilter,
                this.state.taskFilters.keywordFilter,
            );
            teamTasksFilter = and(
                teamTasksFilter,
                this.state.taskFilters.keywordFilter,
            );
        }

        let needAttention = this.state.needAttentionTask;
        if (needAttention) {
            if (!personalTasksFilter(needAttention)) {
                needAttention = undefined;
            }
        }

        return (
            <div className={styles.Execution} onScrollCapture={this.onScroll}>
                <div className={styles.Tabs}>
                    <div className={styles.Container}>
                        <TabsUI
                            defaultSelectedIndex={0}
                            tabNames={['Me', 'Team']}
                            onTabClick={this.onTabClick}
                        />
                    </div>
                </div>
                <div className={styles.Content}>
                    <Route
                        router={this.props.deps.router}
                        pathPattern={routes[0]}
                    >
                        <PersonalStatusUI
                            deps={this.props.deps}
                            needAttentionTask={needAttention}
                            personalTasks={this.state.teamTasks.filter(
                                personalTasksFilter,
                            )}
                            taskAdding={this.state.taskAdding}
                            taskSelectingOwner={this.state.taskSelectingOwner}
                            onAddClick={this.onPersonalAddClick}
                            onViewTaskDetailClick={this.onViewTaskDetailClick}
                            onNewTaskChange={this.onNewTaskChange}
                            onCreateTask={this.onCreateTask}
                            onUpdateTask={this.onUpdateTask}
                            onDeleteTaskClick={this.onDeleteTaskClick}
                            onStartTaskClick={this.onStartTaskClick}
                            onCompleteTaskClick={this.onCompleteTaskClick}
                            onShowPotentialTaskOwners={
                                this.onShowPotentialTaskOwners
                            }
                        />
                    </Route>
                    <Route
                        router={this.props.deps.router}
                        pathPattern={routes[1]}
                    >
                        <KanbanUI
                            tasks={this.state.teamTasks.filter(teamTasksFilter)}
                            taskAdding={this.state.taskAdding}
                            taskSelectingOwner={this.state.taskSelectingOwner}
                            onAddClick={this.onTeamAddClick}
                            onViewTaskDetailClick={this.onViewTaskDetailClick}
                            onNewTaskChange={this.onNewTaskChange}
                            onCreateTask={this.onCreateTask}
                            onUpdateTask={this.onUpdateTask}
                            onDeleteTaskClick={this.onDeleteTaskClick}
                            onStartTaskClick={this.onStartTaskClick}
                            onCompleteTaskClick={this.onCompleteTaskClick}
                            onShowPotentialTaskOwners={
                                this.onShowPotentialTaskOwners
                            }
                        />
                    </Route>
                </div>
                <TaskDetailModalComponent
                    ref={this.taskDetailModalRef}
                    deps={this.props.deps}
                    taskSelectingOwner={this.state.taskSelectingOwner?.id}
                    onShowPotentialTaskOwners={this.onShowPotentialTaskOwners}
                />
                {this.state.showPotentialTaskOwnersList && (
                    <div
                        ref={this.taskOwnersPopupRef}
                        className={styles.SelectTaskOwnerList}
                        style={{
                            left: this.state.taskOwnersListLeft,
                            top: this.state.taskOwnersListTop,
                            visibility: this.state.taskOwnersListVisible
                                ? 'visible'
                                : 'hidden',
                        }}
                        tabIndex={-1}
                        onBlur={this.onCloseTaskOwnersListClick}
                    >
                        <div className={styles.SelectTaskOwnerListHeader}>
                            <div
                                className={styles.CloseButton}
                                onClick={this.onCloseTaskOwnersListClick}
                            >
                                <MaterialIconUI>close</MaterialIconUI>
                            </div>
                        </div>
                        <SelectUserListUI
                            selectedUserId={
                                this.state.taskSelectingOwner?.owner?.id
                            }
                            users={this.state.potentialTaskOwners}
                            onSelectUser={this.onSelectTaskOwner}
                        />
                    </div>
                )}
            </div>
        );
    }

    public async componentDidMount() {
        this.onTabClick(0);
        window.addEventListener('resize', this.onWindowResize);

        this.stateChangeChan =
            this.props.deps.localStore.subscribeStateChange();
        (async () => {
            while (true) {
                console.log('waiting for localStore state changes');
                const state = await this.stateChangeChan!.pop();
                if (state === undefined) {
                    // check undefined instead of falsy because
                    // a falsy data could be valid data per channel's concern.
                    return;
                }
                this.updateState(state);
            }
        })().then();
    }

    public componentWillUnmount() {
        this.stateChangeChan?.close();
        window.removeEventListener('resize', this.onWindowResize);
    }

    public showTaskDetail(taskId: number | string) {
        this.taskDetailModalRef.current?.open(taskId);
    }

    private updateState = (state: IAppState) => {
        this.setState({
            currentUserId: state.currentUser.id,
            needAttentionTask: state.needAttentionTask,
            teamTasks: state.teamTasks,
            taskFilters: state.taskFilters,
        });
    };

    private onTabClick = (index: number) => {
        this.props.deps.router.navigateTo(routes[index]);
    };

    private onShowPotentialTaskOwners = async (
        task: Task,
        findAlignTargetBoundBox: IBoundingBoxFinder,
    ) => {
        const owners = await this.props.deps.teamService.fetchTeamMembers();
        this.setState({
            potentialTaskOwners: owners,
            taskSelectingOwner: task,
            findTaskOwnersAlignTargetBoundBox: findAlignTargetBoundBox,
            showPotentialTaskOwnersList: true,
        });

        setTimeout(() => {
            this.setState({
                taskOwnersListVisible: true,
            });

            this.taskOwnersPopupRef.current?.focus();
            this.updateTaskOwnersListPosition();
        });
    };

    private onSelectTaskOwner = (userId: string) => {
        this.props.deps.localStore.mutate({
            type: 'UpdateTask',
            task: Object.assign({}, this.state.taskSelectingOwner, {
                owner: Object.assign({}, this.state.taskSelectingOwner?.owner, {
                    id: userId,
                }),
            }),
        });
        this.setState({
            potentialTaskOwners: [],
            showPotentialTaskOwnersList: false,
            taskOwnersListVisible: false,
            taskSelectingOwner: undefined,
        });
    };

    private updateTaskOwnersListPosition = () => {
        if (!this.state.showPotentialTaskOwnersList) {
            return;
        }

        if (!this.state.findTaskOwnersAlignTargetBoundBox) {
            return;
        }

        const boundingBox = this.state.findTaskOwnersAlignTargetBoundBox();
        const width = this.taskOwnersPopupRef.current?.offsetWidth || 0;
        const height = this.taskOwnersPopupRef.current?.offsetHeight || 0;
        const left = Math.min(
            boundingBox.left,
            document.body.clientWidth - width - taskOwnersListHorizontalOffset,
        );
        let top =
            boundingBox.top + boundingBox.height + taskOwnersListVerticalOffset;
        if (top + height > document.body.clientHeight) {
            top = boundingBox.top - height - taskOwnersListVerticalOffset;
        }

        this.setState({
            taskOwnersListLeft: left,
            taskOwnersListTop: top,
        });
    };

    private onWindowResize = () => {
        this.updateTaskOwnersListPosition();
    };

    private onScroll = () => {
        if (!this.state.showPotentialTaskOwnersList) {
            return;
        }

        this.taskOwnersPopupRef.current?.blur();
    };

    private onViewTaskDetailClick = async (
        taskId: number | string,
    ): Promise<void> => {
        this.showTaskDetail(taskId);
    };

    private onNewTaskChange = (task: Task) => {
        this.setState({
            taskAdding: task,
        });
    };

    private onCreateTask = (task: Task): void => {
        if (task.goal.length > 0) {
            console.log('creating task');
            this.props.deps.localStore.mutate({
                type: 'CreateTask',
                task: task,
                teamId: this.props.deps.localStore.getState().activeTeamId,
            });
        }

        // remove the adding task UI
        this.setState({
            taskAdding: undefined,
        });
    };

    private onUpdateTask = (task: Task) => {
        this.props.deps.localStore.mutate({
            type: 'UpdateTask',
            task: task,
        });
    };

    private onDeleteTaskClick = (taskId: number | string): void => {
        // don't care if the consumer is ready to pop, no await
        this.props.deps.localStore.mutate({
            type: 'DeleteTask',
            taskId: taskId,
        });
    };

    private onStartTaskClick = (taskId: number | string): void => {
        // don't care if the consumer is ready to pop, no await
        this.props.deps.localStore.mutate({
            type: 'StartTask',
            taskId: taskId,
        });
    };

    private onCompleteTaskClick = (taskId: number | string): void => {
        // don't care if the consumer is ready to pop, no await
        this.props.deps.localStore.mutate({
            type: 'CompleteTask',
            taskId: taskId,
        });
    };

    private onPersonalAddClick = async (): Promise<void> => {
        const user = await this.props.deps.userService.fetchMe('cache-first');
        this.setState({
            taskAdding: {
                id: -1,
                goal: '',
                owner: user,
                availableActions: [TaskAction.AssignOwner, TaskAction.Delete],
                status: 'UPCOMING',
            },
        });
    };

    private onTeamAddClick = () => {
        this.setState({
            taskAdding: {
                id: -1,
                goal: '',
                availableActions: [TaskAction.AssignOwner, TaskAction.Delete],
                status: 'UPCOMING',
            },
        });
    };

    private onCloseTaskOwnersListClick = () => {
        this.setState({
            potentialTaskOwners: [],
            taskSelectingOwner: undefined,
            taskOwnersListVisible: false,
            showPotentialTaskOwnersList: false,
        });
    };
}
