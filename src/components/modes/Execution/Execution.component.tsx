import { History, LocationState } from 'history';
import React, { Component, createRef, ReactElement, RefObject } from 'react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { Unsubscribe } from 'redux';
import { Deps } from '../../../deps';
import PersonalStatus from '../../../entity/PersonalStatus';
import Task from '../../../entity/Task';
import { TaskAction } from '../../../entity/TaskAction';
import TeamStatus from '../../../entity/TeamStatus';
import { User } from '../../../entity/User';
import { updatePersonalStatus } from '../../../store/slices/PersonalStatus';
import { updateTeamStatus } from '../../../store/slices/TeamStatus';
import store from '../../../store/store';
import { IBoundingBoxFinder } from '../../../entity/position';
import { SelectUserListComponent } from '../../shared/SelectUserList.component';
import TaskModalComponent from '../../shared/TaskModal.component';
import MaterialIconComponent from '../../ui/MaterialIcon.component';
import TabsComponent from '../../ui/Tabs.component';
import styles from './Execution.component.module.scss';
import PersonalComponent from './Personal.component';
import TeamComponent from './Team.component';
import { FetchPolicy } from '@apollo/client';
import * as queries from '../../../service/queries';

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
    assignOwnerUIBoundingBoxFinder?: IBoundingBoxFinder;
    potentialTaskOwners: User[];
    taskAdding?: Task;
}

export class ExecutionComponent extends Component<IProps, IState> {
    private taskDetailModalRef = createRef<TaskModalComponent>();
    private taskOwnersPopupRef = createRef<HTMLDivElement>();
    private unsubscribe?: Unsubscribe;

    constructor(props: IProps) {
        super(props);

        const newState = store.getState();
        this.state = {
            showPotentialTaskOwnersList: false,
            taskOwnersListLeft: -1000,
            taskOwnersListTop: -1000,
            personalStatus: newState.personalStatus,
            teamStatus: newState.teamStatus,
            potentialTaskOwners: [],
        };
    }

    public render(): ReactElement {
        return (
            <div className={styles.Execution} onScrollCapture={this.onScroll}>
                <div className={styles.Tabs}>
                    <div className={styles.Container}>
                        <TabsComponent
                            defaultSelectedIndex={0}
                            tabNames={['Me', 'Team']}
                            onTabClick={this.onTabClick}
                        />
                    </div>
                </div>
                <div className={styles.Content}>
                    <Switch>
                        <Route path={`${this.props.routerUrl}me`}>
                            <PersonalComponent
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
                            <TeamComponent
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
                                <MaterialIconComponent>
                                    close
                                </MaterialIconComponent>
                            </div>
                        </div>
                        <SelectUserListComponent
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

        this.unsubscribe = store.subscribe(() => {
            const newState = store.getState();
            this.setState({
                personalStatus: newState.personalStatus,
                teamStatus: newState.teamStatus,
            });
        });
        await this.refresh('cache-first');
    }

    public componentWillUnmount() {
        this.unsubscribe?.call(this);
        window.removeEventListener('resize', this.onWindowResize);
    }

    public showTaskDetail(task: Task) {
        this.taskDetailModalRef.current?.open(task);
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
        const task = await this.props.deps.taskService.fetchTask(taskId);
        this.showTaskDetail(task);
    };

    private onNewTaskChange = (task: Task) => {
        this.setState({
            taskAdding: task,
        });
    };

    private onCreateTask = async (task: Task): Promise<void> => {
        if (task.goal.length > 0) {
            await this.props.deps.taskService.createTask(task);
            await this.refresh('network-only');
        }

        this.setState({
            taskAdding: undefined,
        });
    };

    private onUpdateTask = async (task: Task) => {
        await this.props.deps.taskService.updateTask(task);
        await this.refresh('network-only');
    };

    private onDeleteTaskClick = async (taskId: number): Promise<void> => {
        await this.props.deps.taskService.deleteTask(taskId);
        await this.refresh('network-only');
    };

    private onStartTaskClick = async (taskId: number): Promise<void> => {
        await this.props.deps.taskService.startTask(taskId);
        await this.refresh('network-only');
    };

    private onCompleteTaskClick = async (taskId: number): Promise<void> => {
        await this.props.deps.taskService.completeTask(taskId);
        await this.refresh('network-only');
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

    public async refresh(policy: FetchPolicy) {
        console.log('refresh', policy);
        const data = await this.props.deps.graphql.query({
            fetchPolicy: policy,
            query: queries.Me,
        });
        if (data.me.activeTeam) {
            store.dispatch(
                updatePersonalStatus({
                    needAttentionTask:
                        data.me?.activeTeam?.tasksNeedAttention[0],
                    // todo: use apollo cli to compile query to TS interfaces to have type hint
                    upcomingTasks: data.me?.activeTeam?.upcomingTasks.filter(
                        (task: Task) => task.owner?.id === data?.me?.id,
                    ),
                    deliveredTasks: data.me?.activeTeam?.deliveredTasks.filter(
                        (task: Task) => task.owner?.id === data.me?.id,
                    ),
                }),
            );
            store.dispatch(
                updateTeamStatus({
                    upcomingTasks: data.me?.activeTeam?.upcomingTasks,
                    inProgressTasks: data.me?.activeTeam?.inProgressTasks,
                    deliveredTasks: data.me?.activeTeam?.deliveredTasks,
                }),
            );
        }
    }
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
