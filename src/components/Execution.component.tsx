import { FetchPolicy } from '@apollo/client';
import { Deps } from '@deps';
import * as events from '@entity/events';
import { RefreshTeam } from '@entity/events';
import { PersonalStatus } from '@entity/personalStatus';
import { IBoundingBoxFinder } from '@entity/position';
import { Task } from '@entity/task';
import { TaskAction } from '@entity/taskAction';
import { TeamStatus } from '@entity/teamStatus';
import { User } from '@entity/user';
import * as csp from '@lib/csp/csp';
import { IStateSyncer } from '@lib/store/responsiveState.service';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TabsUI } from '@lib/ui/Tabs';
import * as queries from '@service/queries';
import { IAppState } from '@state/state';
import { History, LocationState } from 'history';
import React, { Component, createRef, ReactElement, RefObject } from 'react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import styles from './Execution.component.module.scss';
import Team from './shared/Kanban';
import { TaskModalComponent } from './shared/Modals/TaskModal.component';
import PersonalUI from './shared/PersonalStatus';
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
    personalStatus: PersonalStatus;
    teamStatus: TeamStatus;
    taskSelectingOwner?: Task;
    potentialTaskOwners: User[];
    taskAdding?: Task;
}

export class ExecutionComponent extends Component<IProps, IState> {
    private readonly taskDetailModalRef = createRef<TaskModalComponent>();
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
            personalStatus: {
                upcomingTasks: [],
                deliveredTasks: [],
            },
            teamStatus: {
                upcomingTasks: [],
                inProgressTasks: [],
                deliveredTasks: [],
            },
            potentialTaskOwners: [],
        };
    }

    public render(): ReactElement {
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
                            <PersonalUI
                                multiCaster={this.multiCaster}
                                deps={this.props.deps}
                                personalStatus={this.state.personalStatus}
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
                            <Team
                                multiCaster={this.multiCaster}
                                teamStatus={this.state.teamStatus}
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
                <TaskModalComponent
                    ref={this.taskDetailModalRef}
                    deps={this.props.deps}
                    mutationOutputChan={this.mutationChan}
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
                return await this.props.deps.graphql.query({
                    fetchPolicy: 'network-only',
                    query: queries.mePage,
                });
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

    public showTaskDetail(task: Task) {
        this.taskDetailModalRef.current?.open(task);
    }

    public async refresh(policy: FetchPolicy) {
        console.log('refresh', policy);
        const data = await this.props.deps.graphql.query({
            fetchPolicy: policy,
            query: queries.mePage,
        });
        this.refreshState(data);
    }

    private refreshState = (data: any) => {
        const event = createRefreshTeamEvent(data);
        if (event) {
            this.props.deps.localStore.mutate(event);
        }
    };

    private updateLocalStateWithRawData = (data: any) => {
        const event = createRefreshTeamEvent(data);
        if (event) {
            const newState = this.props.deps.localStore.mutate(event, false);
            this.updateState(newState);
        }
    };

    private updateState = (state: IAppState) => {
        this.setState({
            personalStatus: {
                needAttentionTask: state.needAttentionTask,
                upcomingTasks: state.teamStatus.upcomingTasks.filter(
                    (task: Task) => task.owner?.id === state.currentUserId,
                ),
                deliveredTasks: state.teamStatus.deliveredTasks.filter(
                    (task: Task) => task.owner?.id === state.currentUserId,
                ),
            },
            teamStatus: state.teamStatus,
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
        const task = await this.props.deps.taskService.fetchTask(
            taskId,
            'cache-first',
        );
        this.showTaskDetail(task);
    };

    private onNewTaskChange = (task: Task) => {
        this.setState({
            taskAdding: task,
        });
    };

    private onCreateTask = (task: Task): void => {
        if (task.goal.length > 0) {
            this.mutationChan.put({
                type: 'CreateTask',
                task: task,
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
            },
        });
    };

    private onTeamAddClick = () => {
        this.setState({
            taskAdding: {
                id: -1,
                goal: '',
                availableActions: [TaskAction.AssignOwner, TaskAction.Delete],
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
            deliveredTasks: activeTeam.deliveredTasks,
            inProgressTasks: activeTeam.inProgressTasks,
            upcomingTasks: activeTeam.upcomingTasks,
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
