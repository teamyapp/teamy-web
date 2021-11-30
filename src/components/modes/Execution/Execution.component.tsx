import { History, LocationState } from 'history';
import React, { Component, createRef, ReactElement, RefObject } from 'react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { Unsubscribe } from 'redux';
import PersonalStatus from '../../../entity/PersonalStatus';
import Task from '../../../entity/Task';
import { TaskAction } from '../../../entity/TaskAction';
import TeamStatus from '../../../entity/TeamStatus';
import { User } from '../../../entity/User';
import { ExecutionModeService } from '../../../service/ExecutionMode.service';
import { TaskService } from '../../../service/Task.service';
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
    routerUrl: string;
    routerHistory: History<LocationState>;
    executionModeService: ExecutionModeService;
    taskService: TaskService;
}

interface IContainerState {
    personalStatus: PersonalStatus;
    teamStatus: TeamStatus;
    taskAdding?: Task;
}

class StatefulComponent extends Component<IContainerProps, IContainerState> {
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
        // TODO: retrieve current user ID from user service
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

        await this.refreshExecutionStatus();
    }

    public componentWillUnmount() {
        this.unsubscribe?.call(this);
    }

    private onViewTaskDetailClick = async (taskId: number): Promise<void> => {
        const task = await this.props.taskService.fetchTask(taskId);
        this.executionComponentRef.current?.showTaskDetail(task);
    };

    private onNewTaskChange = (task: Task) => {
        this.setState({
            taskAdding: task,
        });
    };

    private onCreateTask = async (task: Task): Promise<void> => {
        if (task.goal.length > 0) {
            await this.props.taskService.createTask(task);
            await this.refreshExecutionStatus();
        }

        this.setState({
            taskAdding: undefined,
        });
    };

    private onUpdateTask = (task: Task) => {
        console.log('onUpdateTask', task);
    };

    private onDeleteTaskClick = async (taskId: number): Promise<void> => {
        await this.props.taskService.deleteTask(taskId);
        await this.refreshExecutionStatus();
    };

    private onStartTaskClick = async (taskId: number): Promise<void> => {
        await this.props.taskService.startTask(taskId);
        await this.refreshExecutionStatus();
    };

    private onPersonalAddClick = () => {
        console.log('onPersonalAddClick');
        // TODO: fetch user ID from user service
        this.setState({
            taskAdding: {
                id: -1,
                goal: '',
                owner: {
                    id: 1,
                },
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

    private findPotentialOwnersForTask(taskId: number): Promise<User[]> {
        // TODO: fetch potential owners for a given task
        return Promise.resolve([]);
    }

    private async refreshExecutionStatus() {
        const personalStatus =
            await this.props.executionModeService.fetchPersonalStatus();
        if (personalStatus) {
            store.dispatch(updatePersonalStatus(personalStatus));
        }

        const teamStatus =
            await this.props.executionModeService.fetchTeamStatus();

        if (teamStatus) {
            store.dispatch(updateTeamStatus(teamStatus));
        }
    }
}

interface IHookProps {
    taskService: TaskService;
    executionModeService: ExecutionModeService;
}

export default function ExecutionComponentHook(props: IHookProps) {
    const { url } = useRouteMatch();
    const routerHistory = useHistory();
    return (
        <StatefulComponent
            taskService={props.taskService}
            executionModeService={props.executionModeService}
            routerUrl={url}
            routerHistory={routerHistory}
        />
    );
}
