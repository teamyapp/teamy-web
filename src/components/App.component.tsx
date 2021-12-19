import { FetchPolicy } from '@apollo/client';
import React, { Component, createRef, ReactElement } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Deps } from '../deps';
import Team from '../entity/Team';
import { withIdentityVerification } from '../identity/withIdentityVerification';
import * as queries from '../service/queries';
import store from '../store/store';
import { MaterialIconUI } from '../ui/view/MaterialIcon';
import styles from './App.component.module.scss';
import { DebugComponent } from './Debug.component';
import ExecutionComponentHook, { ExecutionComponent } from './Execution.component';
import { DrawerUI } from './shared/Drawer';
import { TeamSettingsModalComponent } from './shared/TeamModal.component';

interface IProps {
    deps: Deps;
}

interface IState {
    teams: Team[];
    activeTeamId: number;
    isDrawerOpen: boolean;
}

class AppComponent extends Component<IProps, IState> {
    private executionRef = createRef<ExecutionComponent>();
    private teamSettingsModalRef = createRef<TeamSettingsModalComponent>();

    constructor(props: any) {
        super(props);
        this.state = {
            isDrawerOpen: false,
            teams: [],
            activeTeamId: -1,
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
                        <DrawerUI
                            activeTeamId={this.state.activeTeamId}
                            teams={this.state.teams}
                            isDrawerOpen={this.state.isDrawerOpen}
                            onMenuClose={this.onMenuToggle}
                            onActiveTeamSelect={this.onActiveTeamSelect}
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
                                            <MaterialIconUI>
                                                menu
                                            </MaterialIconUI>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.TeamName}>Teamy</div>
                            </header>
                            <div className={styles.Execution}>
                                {
                                    <ExecutionComponentHook
                                        executionRef={this.executionRef}
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

    public async componentDidMount() {
        await this.refresh('cache-first');
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
    const AppWithIdentityVerification = withIdentityVerification(
        props.deps.identityClient,
        AppComponent,
    );
    return (
        <Provider store={store}>
            <BrowserRouter>
                <AppWithIdentityVerification deps={props.deps} />
            </BrowserRouter>
        </Provider>
    );
}
