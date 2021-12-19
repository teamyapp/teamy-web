import { FetchPolicy } from '@apollo/client';
import React, { Component, createRef, ReactElement, RefObject } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Deps } from '../deps';
import Team from '../entity/Team';
import { withIdentity } from '../identity/withIdentity';
import store from '../store/store';
import styles from './App.component.module.scss';
import { DebugComponent } from './Debug.component';
import DrawerComponent from './Drawer.component';
import ExecutionComponentHook, {
    StatefulExecutionComponent,
} from './modes/Execution/Execution.component';
import { TeamSettingsModalComponent } from './shared/TeamModal.component';
import MaterialIconComponent from './ui/MaterialIcon.component';
import * as queries from '../service/queries';

interface IProps {
    executionRef: RefObject<StatefulExecutionComponent>;
    deps: Deps;
    teams: Team[];
    activeTeamId: number;
    onActiveTeamSelect?: (teamId: number) => void;
}

interface IState {
    isDrawerOpen: boolean;
}

class AppComponent extends Component<IProps, IState> {
    private teamSettingsModalRef = createRef<TeamSettingsModalComponent>();

    constructor(props: any) {
        super(props);
        this.state = {
            isDrawerOpen: false,
        };
    }

    public render() {
        return (
            <div className={styles.App}>
                <Switch>
                    <Route path={'/debug'}>
                        <DebugComponent
                            repoOwner={'teamyapp'}
                            repoName={'teamy-web'}
                        />
                    </Route>
                    <Route path={'/'}>
                        <DrawerComponent
                            activeTeamId={this.props.activeTeamId}
                            teams={this.props.teams}
                            isDrawerOpen={this.state.isDrawerOpen}
                            onMenuClose={this.onMenuToggle}
                            onActiveTeamSelect={this.props.onActiveTeamSelect}
                            onAddTeamMembersClick={this.onAddTeamMembersClick}
                            onShowTeamMembersClick={this.onShowTeamMembersClick}
                            onViewTeamSettings={this.onViewTeamSettings}
                        />
                        <div className={styles.Content}>
                            <header className={styles.Header}>
                                <div className={styles.MenuButtonPlaceHolder}>
                                    {!this.state.isDrawerOpen && (
                                        <div
                                            className={styles.MenuButton}
                                            onClick={this.onMenuToggle}
                                        >
                                            <MaterialIconComponent>
                                                menu
                                            </MaterialIconComponent>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.TeamName}>Teamy</div>
                            </header>
                            <div className={styles.Execution}>
                                {
                                    <ExecutionComponentHook
                                        executionRef={this.props.executionRef}
                                        deps={this.props.deps}
                                    />
                                }
                            </div>
                        </div>
                    </Route>
                </Switch>
                <TeamSettingsModalComponent
                    deps={this.props.deps}
                    ref={this.teamSettingsModalRef}
                />
            </div>
        );
    }

    private onMenuToggle = () => {
        this.setState({
            isDrawerOpen: !this.state.isDrawerOpen,
        });
    };

    private onAddTeamMembersClick = () => {
        console.log('onAddTeamMembersClick');
    };

    private onShowTeamMembersClick = (teamId: number) => {
        this.teamSettingsModalRef.current?.open(teamId, 1);
    };

    private onViewTeamSettings = (teamId: number) => {
        this.teamSettingsModalRef.current?.open(teamId);
    };
}

interface IContainerProps {
    deps: Deps;
}

interface IContainerState {
    teams: Team[];
    activeTeamId: number;
}

class AppComponentContainer extends Component<
    IContainerProps,
    IContainerState
> {
    private executionRef: RefObject<StatefulExecutionComponent> = createRef();

    constructor(props: IContainerProps) {
        super(props);
        this.state = {
            teams: [],
            activeTeamId: -1,
        };
    }

    public render(): ReactElement {
        return (
            <AppComponent
                executionRef={this.executionRef}
                activeTeamId={this.state.activeTeamId}
                teams={this.state.teams}
                onActiveTeamSelect={this.onActiveTeamSelect}
                {...this.props}
            />
        );
    }

    public async componentDidMount() {
        await this.refresh('cache-first');
    }

    private onActiveTeamSelect = async (teamId: number): Promise<void> => {
        await this.props.deps.teamService.updateActiveTeamId(teamId);
        await this.refresh('network-only');
    };

    private async refresh(policy: FetchPolicy) {
        console.log('refresh App', policy);
        const data = await this.props.deps.graphql.query({
            fetchPolicy: policy,
            query: queries.Me,
        });
        const teams: Team[] = data.me.teams;
        const activeTeamId = data.me.activeTeam?.id;
        this.setState({
            teams,
            activeTeamId,
        });
        await this.executionRef.current?.refresh('cache-first');
    }
}

interface IHookProps {
    deps: Deps;
}

export default function AppComponentHook(props: IHookProps): ReactElement {
    const AppWithIdentity = withIdentity(
        props.deps.identityClient,
        AppComponentContainer,
    );
    return (
        <Provider store={store}>
            <BrowserRouter>
                <AppWithIdentity deps={props.deps} />
            </BrowserRouter>
        </Provider>
    );
}
