import { FetchPolicy } from '@apollo/client';
import * as csp from '@creatcodebuild/csp';
import { Deps } from '@deps';
import { PersonalStatus } from '@entity/personalStatus';
import { IBoundingBoxFinder } from '@entity/position';
import { Task } from '@entity/task';
import { getActions, TaskAction } from '@entity/taskAction';
import { TeamStatus } from '@entity/teamStatus';
import { User } from '@entity/user';
import { IAppState } from '@state/state';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TabsUI } from '@lib/ui/Tabs';
import { History, LocationState } from 'history';
import React, { Component, createRef, ReactElement, RefObject } from 'react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import * as events from '@entity/events';
import * as queries from '@service/queries';
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
    private taskDetailModalRef = createRef<TaskModalComponent>();
    private taskOwnersPopupRef = createRef<HTMLDivElement>();
    private readonly multiCaster: csp.Multicaster<events.MutationEvent>;
    private readonly mutationChan: csp.Channel<events.MutationEvent>;
    private readonly mutationListener: csp.Channel<
        events.MutationEvent | undefined
    >;
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

        // Channels that communicates mutation events
        // source channel for putting mutation events
        this.mutationChan = csp.chan<events.MutationEvent>();
        // a multicaster used to other components to subscribe the event
        this.multiCaster = csp.multi<events.MutationEvent>(this.mutationChan);
        this.mutationListener = this.multiCaster.copy();
    }

    private async listenToMutation() {
        // move all elements from array1 which meet the given condition into array2
        // creating 2 new arrays
        function moveTo<T>(
            array1: Array<T>,
            array2: Array<T>,
            find: (element: T) => boolean,
            transform: (element: T) => T,
        ): [Array<T>, Array<T>] {
            let toBeMoved = array1.filter(find);
            let newArray1 = array1.filter((ele) => !find(ele));
            return [newArray1, array2.concat(toBeMoved.map(transform))];
        }

        const chan = csp.chan<events.MutationEvent>();
        (async () => {
            // this coroutine handles network refresh only
            // and each refresh takes place in order
            while (true) {
                // check if the channel is empty.
                // because csp.Channel does not expose the internal buffer
                // nor expose a public isEmpty / length method,
                // to check if the channel is empty, it means to check if the channel is not ready to be consumed.
                // TODO: consider adding synchronized versions of these methods
                let result = await Promise.any([
                    chan.ready(),
                    Promise.resolve(null),
                ]);
                if (result === null) {
                    // the channel is not ready therefore empty
                    console.log('mutation channel is empty');
                    console.log('refresh start');
                    const data = await this.props.deps.graphql.query({
                        fetchPolicy: 'network-only',
                        query: queries.mePage,
                    });
                    let isEmpty = await Promise.any([
                        chan.ready(),
                        Promise.resolve(null),
                    ]);
                    if (isEmpty === null) {
                        this.refreshState(data);
                        console.log('refresh done');
                    } else {
                        console.log(
                            'refresh discarded because new mutations happened in the mean time',
                        );
                    }
                } else {
                    console.log('mutation channel is not empty');
                }
                let event = await chan.pop();
                if (event === undefined) {
                    return;
                }
                switch (event.type) {
                    case 'CreateTask':
                        await this.props.deps.taskService.createTask(
                            event.task,
                        );
                        break;
                    case 'DeleteTask':
                        await this.props.deps.taskService.deleteTask(
                            event.taskId,
                        );
                        break;
                    case 'StartTask':
                        await this.props.deps.taskService.startTask(
                            event.taskId,
                        );
                        break;
                    case 'CompleteTask':
                        await this.props.deps.taskService.completeTask(
                            event.taskId,
                        );
                        break;
                }
                console.log(event.type, 'done');
            }
        })().then();

        // synchronized part of mutation listener
        while (true) {
            let event = await this.mutationListener.pop();
            if (event === undefined) {
                return;
            }
            // do not care what events are received, refresh anyway
            console.log('mutation happened', event.type);
            if (event.type === 'CreateTask') {
                event.task.availableActions = getActions('Upcoming');
                this.setState({
                    teamStatus: Object.assign({}, this.state.teamStatus, {
                        upcomingTasks:
                            this.state.teamStatus.upcomingTasks.concat(
                                event.task,
                            ),
                    }),
                });
            } else if (event.type === 'StartTask') {
                let taskId = event.taskId;
                let [upcomingTasks, inProgressTasks] = moveTo(
                    this.state.teamStatus.upcomingTasks,
                    this.state.teamStatus.inProgressTasks,
                    (task) => task.id === taskId,
                    (task) => {
                        return Object.assign({}, task, {
                            availableActions: getActions('InProgress'),
                        });
                    },
                );
                this.setState({
                    teamStatus: Object.assign({}, this.state.teamStatus, {
                        upcomingTasks: upcomingTasks,
                        inProgressTasks: inProgressTasks,
                    }),
                });
            } else if (event.type === 'DeleteTask') {
                let taskId = event.taskId;
                this.setState({
                    teamStatus: {
                        upcomingTasks:
                            this.state.teamStatus.upcomingTasks.filter(
                                (element) => element.id !== taskId,
                            ),
                        inProgressTasks:
                            this.state.teamStatus.inProgressTasks.filter(
                                (element) => element.id !== taskId,
                            ),
                        deliveredTasks:
                            this.state.teamStatus.deliveredTasks.filter(
                                (element) => element.id !== taskId,
                            ),
                    },
                });
            } else if (event.type === 'CompleteTask') {
                let taskId = event.taskId;
                let [inProgressTasks, deliveredTasks] = moveTo(
                    this.state.teamStatus.inProgressTasks,
                    this.state.teamStatus.deliveredTasks,
                    (task) => task.id === taskId,
                    (task) => {
                        return Object.assign({}, task, {
                            availableActions: getActions('Delivered'),
                        });
                    },
                );
                this.setState({
                    teamStatus: Object.assign({}, this.state.teamStatus, {
                        inProgressTasks: inProgressTasks,
                        deliveredTasks: deliveredTasks,
                    }),
                });
            }
            // after synchronized updates, do async network refresh
            // do not await
            chan.put(event);
        }
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
                    mutationChan={this.mutationChan}
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
        this.listenToMutation();
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

                this.setState({
                    personalStatus: {
                        needAttentionTask: state.needAttentionTask,
                        upcomingTasks: state.teamStatus.upcomingTasks.filter(
                            (task: Task) =>
                                task.owner?.id === state.currentUserId,
                        ),
                        deliveredTasks: state.teamStatus.deliveredTasks.filter(
                            (task: Task) =>
                                task.owner?.id === state.currentUserId,
                        ),
                    },
                    teamStatus: state.teamStatus,
                });
            }
        })().then();
        await this.refresh('cache-first');
    }

    public componentWillUnmount() {
        this.stateChangeChan?.close?.call(null);
        this.mutationListener.close();
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
    private refreshState(data: any) {
        if (data?.me?.activeTeam) {
            const activeTeam = data.me?.activeTeam;
            this.props.deps.localStore.mutate({
                type: 'RefreshTeam',
                currentUserId: data.me?.id,
                tasksNeedAttention: activeTeam?.tasksNeedAttention,
                deliveredTasks: activeTeam?.deliveredTasks,
                inProgressTasks: activeTeam?.inProgressTasks,
                upcomingTasks: activeTeam?.upcomingTasks,
            });
        }
    }

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

    private onSelectTaskOwner = async (userId: number) => {
        await this.props.deps.taskService.updateTask(
            Object.assign({}, this.state.taskSelectingOwner, {
                owner: Object.assign({}, this.state.taskSelectingOwner?.owner, {
                    id: userId,
                }),
            }),
        );
        this.setState({
            potentialTaskOwners: [],
            showPotentialTaskOwnersList: false,
            taskSelectingOwner: undefined,
        });
        await this.refresh('network-only');
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

    private onCreateTask = async (task: Task): Promise<void> => {
        if (task.goal.length > 0) {
            await this.mutationChan.put({
                type: 'CreateTask',
                task: task,
            });
        }

        // remove the adding task UI
        this.setState({
            taskAdding: undefined,
        });
    };

    private onUpdateTask = async (task: Task) => {
        await this.props.deps.taskService.updateTask(task);
        await this.refresh('network-only');
    };

    private onDeleteTaskClick = async (taskId: number): Promise<void> => {
        // don't care if the consumer is ready to pop, no await
        this.mutationChan.put({
            type: 'DeleteTask',
            taskId: taskId,
        });
    };

    private onStartTaskClick = async (taskId: number): Promise<void> => {
        // don't care if the consumer is ready to pop, no await
        this.mutationChan.put({
            type: 'StartTask',
            taskId: taskId,
        });
    };

    private onCompleteTaskClick = async (taskId: number): Promise<void> => {
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
