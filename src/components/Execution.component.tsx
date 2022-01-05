import { FetchPolicy } from '@apollo/client';
import { History, LocationState } from 'history';
import React, { Component, ReactElement, RefObject, createRef } from 'react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';

import * as csp from '@lib/csp/csp';
import { IStateSyncer } from '@lib/store/responsiveState.service';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TabsUI } from '@lib/ui/Tabs';

import { OwnedBy } from '@core/data/task.filter';
import { Deps } from '@core/dep/deps';
import * as events from '@core/entity/events';
import { RefreshTeam } from '@core/entity/events';
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

const routes = ['me', 'team'];

const taskOwnersListVerticalOffset = 4;
const taskOwnersListHorizontalOffset = 10;

interface IProps {
    deps: Deps;
    routerUrl: string;
    routerHistory: History<LocationState>;
}

interface IState {
    showPotentialTaskOwnersList: boolean;
    findTaskOwnersAlignTargetBoundBox?: IBoundingBoxFinder;
    taskOwnersListLeft: number;
    taskOwnersListTop: number;
    currentUserId: number;
    needAttentionTask?: Task;
    teamTasks: Task[];
    taskSelectingOwner?: Task;
    potentialTaskOwners: User[];
    taskAdding?: Task;
}

export class ExecutionComponent extends Component<IProps, IState> {
    private readonly taskDetailModalRef = createRef<TaskDetailModalComponent>();
    private readonly taskOwnersPopupRef = createRef<HTMLDivElement>();
    private readonly mutationChan = csp.chan<events.MutationEvent>();
    private readonly multiCaster: csp.Multicaster<events.MutationEvent> =
        csp.multi<events.MutationEvent>(this.mutationChan);
    private readonly mutationOutputChan: csp.PopChannel<
        events.MutationEvent | undefined
    > = this.multiCaster.copy();
    private stateChangeChan?: csp.PopChannel<IAppState>;

    constructor(props: IProps) {
        super(props);
        this.state = {
            showPotentialTaskOwnersList: false,
            taskOwnersListLeft: -1000,
            taskOwnersListTop: -1000,
            currentUserId: -1,
            teamTasks: [],
            potentialTaskOwners: [],
        };
    }

    public render(): ReactElement {
        const personalTasks = this.state.teamTasks.filter(
            OwnedBy(this.state.currentUserId),
        );
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
                    <Switch>
                        <Route path={`${this.props.routerUrl}me`}>
                            <PersonalStatusUI
                                multiCaster={this.multiCaster}
                                deps={this.props.deps}
                                needAttentionTask={this.state.needAttentionTask}
                                personalTasks={personalTasks}
                                taskAdding={this.state.taskAdding}
                                taskSelectingOwner={
                                    this.state.taskSelectingOwner
                                }
                                onAddClick={this.onPersonalAddClick}
                                onViewTaskDetailClick={
                                    this.onViewTaskDetailClick
                                }
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
                    </Switch>
                    <Switch>
                        <Route path={`${this.props.routerUrl}team`}>
                            <KanbanUI
                                multiCaster={this.multiCaster}
                                tasks={this.state.teamTasks}
                                taskAdding={this.state.taskAdding}
                                taskSelectingOwner={
                                    this.state.taskSelectingOwner
                                }
                                onAddClick={this.onTeamAddClick}
                                onViewTaskDetailClick={
                                    this.onViewTaskDetailClick
                                }
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
                    </Switch>
                </div>
                <TaskDetailModalComponent
                    ref={this.taskDetailModalRef}
                    deps={this.props.deps}
                    taskSelectingOwner={this.state.taskSelectingOwner?.id}
                    mutationOutputChan={this.mutationChan}
                    onShowPotentialTaskOwners={this.onShowPotentialTaskOwners}
                />
                {this.state.showPotentialTaskOwnersList && (
                    <div
                        ref={this.taskOwnersPopupRef}
                        className={styles.SelectTaskOwnerList}
                        style={{
                            left: this.state.taskOwnersListLeft,
                            top: this.state.taskOwnersListTop,
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
                const state = await this.stateChangeChan!.pop();
                if (!state) {
                    break;
                }

                this.updateState(state);
            }
        })().then();

        const stateSyncer: IStateSyncer<IAppState> = {
            fetchNetworkState: async (): Promise<any> => {
                return await this.props.deps.pageService.fetchMePage(
                    'network-only',
                );
            },
            updateLocalStateWithRawData: this.updateLocalStateWithRawData,
            updateLocalState: this.updateState,
        };
        this.props.deps.responsiveStateService.listen(
            stateSyncer,
            this.mutationOutputChan,
        );
    }

    public componentWillUnmount() {
        this.mutationChan?.close();
        this.stateChangeChan?.close();
        window.removeEventListener('resize', this.onWindowResize);
    }

    public showTaskDetail(taskId: number) {
        this.taskDetailModalRef.current?.open(taskId);
    }

    public async refresh(policy: FetchPolicy) {
        console.log('refresh', policy);
        const data = await this.props.deps.pageService.fetchMePage(policy);
        this.refreshState(data);
    }

    private refreshState = (data: any) => {
        const event = createRefreshTeamEvent(data);
        if (event) {
            this.props.deps.localStore.mutate(event);
        }
    };

    private updateLocalStateWithRawData = async (data: any) => {
        const event = createRefreshTeamEvent(data);
        if (event) {
            const newState = this.props.deps.localStore.mutate(event, false);
            this.updateState(newState);
            await this.taskDetailModalRef.current?.refresh();
        }
    };

    private updateState = (state: IAppState) => {
        this.setState({
            currentUserId: state.currentUserId,
            needAttentionTask: state.needAttentionTask,
            teamTasks: state.teamTasks,
        });
    };

    private onTabClick = (index: number) => {
        this.props.routerHistory.push(routes[index]);
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
            this.taskOwnersPopupRef.current?.focus();
            this.updateTaskOwnersListPosition();
        });
    };

    private onSelectTaskOwner = (userId: number) => {
        this.mutationChan.put({
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

    private onViewTaskDetailClick = async (taskId: number): Promise<void> => {
        this.showTaskDetail(taskId);
    };

    private onNewTaskChange = (task: Task) => {
        this.setState({
            taskAdding: task,
        });
    };

    private onCreateTask = (task: Task): void => {
        if (task.goal.length > 0) {
            console.log(this.props.deps.localStore.getState().activeTeamId)
            this.mutationChan.put({
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
        this.mutationChan.put({
            type: 'UpdateTask',
            task: task,
        });
    };

    private onDeleteTaskClick = (taskId: number): void => {
        // don't care if the consumer is ready to pop, no await
        this.mutationChan.put({
            type: 'DeleteTask',
            taskId: taskId,
        });
    };

    private onStartTaskClick = (taskId: number): void => {
        // don't care if the consumer is ready to pop, no await
        this.mutationChan.put({
            type: 'StartTask',
            taskId: taskId,
        });
    };

    private onCompleteTaskClick = (taskId: number): void => {
        // don't care if the consumer is ready to pop, no await
        this.mutationChan.put({
            type: 'CompleteTask',
            taskId: taskId,
        });
    };

    private onPersonalAddClick = async (): Promise<void> => {
        console.log('onPersonalAddClick');
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
            showPotentialTaskOwnersList: false,
            taskOwnersListLeft: -1000,
            taskOwnersListTop: -1000,
        });
    };
}

function createRefreshTeamEvent(data: any): RefreshTeam | null {
    const activeTeam = data.me?.activeTeam;
    if (activeTeam) {
        return {
            type: 'RefreshTeam',
            currentUserId: data.me?.id,
            tasksNeedAttention: activeTeam.tasksNeedAttention,
            // TODO: replace with activeTeam.tasks once backend is ready
            teamTasks: activeTeam.upcomingTasks
                .concat(activeTeam.inProgressTasks)
                .concat(activeTeam.deliveredTasks),
        };
    }
    return null;
}

interface IHookProps {
    executionRef: RefObject<ExecutionComponent>;
    deps: Deps;
}

export default function ExecutionComponentHook(props: IHookProps) {
    const { url } = useRouteMatch();
    const routerHistory = useHistory();
    return (
        <ExecutionComponent
            ref={props.executionRef}
            deps={props.deps}
            routerUrl={url}
            routerHistory={routerHistory}
        />
    );
}
