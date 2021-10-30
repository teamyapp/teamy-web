import { History, LocationState } from 'history';
import React, { Component, ReactElement } from 'react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { Unsubscribe } from 'redux';
import PersonalStatus from '../../../entity/PersonalStatus';
import TeamStatus from '../../../entity/TeamStatus';
import { ExecutionModeService } from '../../../service/ExecutionMode.service';
import { updatePersonalStatus } from '../../../store/slices/PersonalStatus';
import { updateTeamStatus } from '../../../store/slices/TeamStatus';
import store from '../../../store/store';
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
}

class ExecutionComponent extends Component<IProps> {
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
                            />
                        </Route>
                    </Switch>
                    <Switch>
                        <Route path={`${this.props.routerUrl}team`}>
                            <TeamComponent teamStatus={this.props.teamStatus} />
                        </Route>
                    </Switch>
                </div>
            </div>
        );
    }

    public componentDidMount() {
        this.onTabClick(0);
    }

    private onTabClick = (index: number) => {
        this.props.routerHistory.push(routes[index]);
    };
}

interface IContainerProps {
    routerUrl: string;
    routerHistory: History<LocationState>;
    executionModeService: ExecutionModeService;
}

interface IContainerState {
    personalStatus: PersonalStatus;
    teamStatus: TeamStatus;
}

class StatefulComponent extends Component<IContainerProps, IContainerState> {
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
                routerUrl={this.props.routerUrl}
                routerHistory={this.props.routerHistory}
                personalStatus={this.state.personalStatus}
                teamStatus={this.state.teamStatus}
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
}

interface IHookProps {
    executionModeService: ExecutionModeService;
}

export default function ExecutionComponentHook(props: IHookProps) {
    const { url } = useRouteMatch();
    const routerHistory = useHistory();
    return (
        <StatefulComponent
            executionModeService={props.executionModeService}
            routerUrl={url}
            routerHistory={routerHistory}
        />
    );
}
