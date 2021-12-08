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
import TaskModalComponent from '../../shared/TaskModal.component';
import TabsComponent from '../../ui/Tabs.component';
import styles from './Execution.component.module.scss';
import PersonalComponent from './Personal.component';
import TeamComponent from './Team.component';

const routes = ['me', 'team'];

interface IProps {
    routerUrl: string;
    routerHistory: History<LocationState>;
    personalStatus: PersonalStatus;
    teamStatus: TeamStatus;
    taskAdding?: Task;
    findPotentialOwnersForTask?: (taskId: number) => Promise<User[]>;
    onViewTaskDetailClick?: (taskId: number) => void;
    onPersonalAddClick?: () => void;
    onTeamAddClick?: () => void;
    onNewTaskChange?: (task: Task) => void;
    onCreateTask?: (task: Task) => void;
    onUpdateTask?: (task: Task) => void;
    onDeleteTaskClick?: (taskId: number) => void;
    onStartTaskClick?: (taskId: number) => void;
    onCompleteTaskClick?: (taskId: number) => void;
}

class ExecutionComponent extends Component<IProps> {
    private taskDetailModalRef = createRef<TaskModalComponent>();

    public render(): ReactElement {
        return (
            <div className={styles.Execution}>
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
                                personalStatus={this.props.personalStatus}
                                taskAdding={this.props.taskAdding}
                                findPotentialOwnersForTask={
                                    this.props.findPotentialOwnersForTask
                                }
                                onAddClick={this.props.onPersonalAddClick}
                                onViewTaskDetailClick={
                                    this.props.onViewTaskDetailClick
                                }
                                onNewTaskChange={this.props.onNewTaskChange}
                                onCreateTask={this.props.onCreateTask}
                                onUpdateTask={this.props.onUpdateTask}
                                onDeleteTaskClick={this.props.onDeleteTaskClick}
                                onStartTaskClick={this.props.onStartTaskClick}
                                onCompleteTaskClick={
                                    this.props.onCompleteTaskClick
                                }
                            />
                        </Route>
                    </Switch>
                    <Switch>
                        <Route path={`${this.props.routerUrl}team`}>
                            <TeamComponent
                                teamStatus={this.props.teamStatus}
                                taskAdding={this.props.taskAdding}
                                findPotentialOwnersForTask={
                                    this.props.findPotentialOwnersForTask
                                }
                                onAddClick={this.props.onTeamAddClick}
                                onViewTaskDetailClick={
                                    this.props.onViewTaskDetailClick
                                }
                                onNewTaskChange={this.props.onNewTaskChange}
                                onCreateTask={this.props.onCreateTask}
                                onUpdateTask={this.props.onUpdateTask}
                                onDeleteTaskClick={this.props.onDeleteTaskClick}
                                onStartTaskClick={this.props.onStartTaskClick}
                                onCompleteTaskClick={
                                    this.props.onCompleteTaskClick
                                }
                            />
                        </Route>
                    </Switch>
                </div>
                <TaskModalComponent ref={this.taskDetailModalRef} />
            </div>
        );
    }

    public componentDidMount() {
        this.onTabClick(0);
    }

    private onTabClick = (index: number) => {
        this.props.routerHistory.push(routes[index]);
    };

    public showTaskDetail(task: Task) {
        this.taskDetailModalRef.current?.open(task);
    }
}

interface IContainerProps {
    deps: Deps;
    routerUrl: string;
    routerHistory: History<LocationState>;
}

interface IContainerState {
    personalStatus: PersonalStatus;
    teamStatus: TeamStatus;
    taskAdding?: Task;
}

export class StatefulExecutionComponent extends Component<
    IContainerProps,
    IContainerState
> {
    private executionComponentRef: RefObject<ExecutionComponent> =
        createRef<ExecutionComponent>();
    private unsubscribe?: Unsubscribe;

    constructor(props: IContainerProps) {
        super(props);

        const newState = store.getState();
        this.state = {
            personalStatus: newState.personalStatus,
            teamStatus: newState.teamStatus,
        };
    }

    public render(): ReactElement {
        return (
            <ExecutionComponent
                ref={this.executionComponentRef}
                routerUrl={this.props.routerUrl}
                routerHistory={this.props.routerHistory}
                personalStatus={this.state.personalStatus}
                teamStatus={this.state.teamStatus}
                taskAdding={this.state.taskAdding}
                findPotentialOwnersForTask={this.findPotentialOwnersForTask}
                onViewTaskDetailClick={this.onViewTaskDetailClick}
                onNewTaskChange={this.onNewTaskChange}
                onCreateTask={this.onCreateTask}
                onUpdateTask={this.onUpdateTask}
                onDeleteTaskClick={this.onDeleteTaskClick}
                onStartTaskClick={this.onStartTaskClick}
                onCompleteTaskClick={this.onCompleteTaskClick}
                onPersonalAddClick={this.onPersonalAddClick}
                onTeamAddClick={this.onTeamAddClick}
            />
        );
    }

    public async componentDidMount() {
        this.unsubscribe = store.subscribe(() => {
            const newState = store.getState();
            this.setState({
                personalStatus: newState.personalStatus,
                teamStatus: newState.teamStatus,
            });
        });

        await this.refresh();
    }

    public componentWillUnmount() {
        this.unsubscribe?.call(this);
    }

    private onViewTaskDetailClick = async (taskId: number): Promise<void> => {
        const task = await this.props.deps.taskService.fetchTask(taskId);
        this.executionComponentRef.current?.showTaskDetail(task);
    };

    private onNewTaskChange = (task: Task) => {
        this.setState({
            taskAdding: task,
        });
    };

    private onCreateTask = async (task: Task): Promise<void> => {
        if (task.goal.length > 0) {
            await this.props.deps.taskService.createTask(task);

            await this.refresh();
        }

        this.setState({
            taskAdding: undefined,
        });
    };

    private onUpdateTask = async (task: Task) => {
        await this.props.deps.taskService.updateTask(task);
        await this.refresh();
    };

    private onDeleteTaskClick = async (taskId: number): Promise<void> => {
        await this.props.deps.taskService.deleteTask(taskId);
        await this.refresh();
    };

    private onStartTaskClick = async (taskId: number): Promise<void> => {
        await this.props.deps.taskService.startTask(taskId);
        await this.refresh();
    };

    private onCompleteTaskClick = async (taskId: number): Promise<void> => {
        await this.props.deps.taskService.completeTask(taskId);
        await this.refresh();
    };

    private onPersonalAddClick = async (): Promise<void> => {
        console.log('onPersonalAddClick');
        const user = await this.props.deps.userService.fetchMe();
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
        console.log('onTeamAddClick');
        this.setState({
            taskAdding: {
                id: -1,
                goal: '',
                availableActions: [TaskAction.AssignOwner, TaskAction.Delete],
            },
        });
    };

    private findPotentialOwnersForTask = async (
        taskId: number,
    ): Promise<User[]> => {
        return await this.props.deps.teamService.fetchTeamMembers();
    };

    public async refresh() {
        const user = await this.props.deps.userService.fetchMe();
        const personalStatus =
            await this.props.deps.executionModeService.fetchPersonalStatus(user.id);
        if (personalStatus) {
            store.dispatch(updatePersonalStatus(personalStatus));
        }

        const teamStatus =
            await this.props.deps.executionModeService.fetchTeamStatus();

        if (teamStatus) {
            store.dispatch(updateTeamStatus(teamStatus));
        }
    }
}

interface IHookProps {
    executionRef: RefObject<StatefulExecutionComponent>;
    deps: Deps;
}

export default function ExecutionComponentHook(props: IHookProps) {
    const { url } = useRouteMatch();
    const routerHistory = useHistory();
    return (
        <StatefulExecutionComponent
            ref={props.executionRef}
            deps={props.deps}
            routerUrl={url}
            routerHistory={routerHistory}
        />
    );
}
