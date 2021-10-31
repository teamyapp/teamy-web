import { History, LocationState } from 'history';
import React, { Component, createRef, ReactElement, RefObject } from 'react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { Unsubscribe } from 'redux';
import PersonalStatus from '../../../entity/PersonalStatus';
import Task from '../../../entity/Task';
import TeamStatus from '../../../entity/TeamStatus';
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
    onViewTaskDetailClick?: (taskId: number) => void;
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
                                onViewTaskDetailClick={
                                    this.onViewTaskDetailClick
                                }
                            />
                        </Route>
                    </Switch>
                    <Switch>
                        <Route path={`${this.props.routerUrl}team`}>
                            <TeamComponent
                                teamStatus={this.props.teamStatus}
                                onViewTaskDetailClick={
                                    this.onViewTaskDetailClick
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

    private onViewTaskDetailClick = async (taskId: number) => {
        if (this.props.onViewTaskDetailClick) {
            this.props.onViewTaskDetailClick(taskId);
        }
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
        return (
            <ExecutionComponent
                ref={this.executionComponentRef}
                routerUrl={this.props.routerUrl}
                routerHistory={this.props.routerHistory}
                personalStatus={this.state.personalStatus}
                teamStatus={this.state.teamStatus}
                onViewTaskDetailClick={this.onViewTaskDetailClick}
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

        const personalStatus =
            await this.props.executionModeService.fetchPersonalStatus();
        if (personalStatus) {
            store.dispatch(updatePersonalStatus(personalStatus));
        }

        const teamStatus =
            await this.props.executionModeService.fetchTeamStatus();

        // TODO: replace with error handling once Identity module is checked in
        if (teamStatus) {
            store.dispatch(updateTeamStatus(teamStatus));
        }
    }

    public componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    private onViewTaskDetailClick = async (taskId: number): Promise<void> => {
        const task = await this.props.taskService.fetchTask(taskId);
        this.executionComponentRef.current?.showTaskDetail(task);
    };
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
