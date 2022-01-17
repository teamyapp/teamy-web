import { FetchPolicy } from '@apollo/client';
import classNames from 'classnames';
import React, { Component, ReactElement, createRef } from 'react';

import * as csp from '@lib/csp/csp';
import { withIdentityVerification } from '@lib/identity/withIdentityVerification';
import { Route } from '@lib/router/Route';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { SpacerUI } from '@lib/ui/Spacer';
import { TooltipUI } from '@lib/ui/Tooltip';

import { Deps } from '@core/dep/deps';
import { Team } from '@core/entity/team';
import { User } from '@core/entity/user';
import { IAppState } from '@core/state/state';

import styles from './App.component.module.scss';
import { DebugComponent } from './Debug.component';
import { ExecutionComponent } from './Execution.component';
import { DrawerUI } from './shared/Drawer';
import { FilterListComponent } from './shared/FilterList.component';
import { AddTeamMembersModalComponent } from './shared/Modals/AddTeamMembersModal.component';
import { TeamSettingsModalComponent } from './shared/Modals/TeamSettingsModal.component';
import { UserSettingsModalComponent } from './shared/Modals/UserSettingsModal.component';
import { UserProfileUI } from './shared/UserProfile';

interface IProps {
    deps: Deps;
}

interface IState {
    me?: User;
    teams: Team[];
    activeTeamId: string;
    isDrawerOpen: boolean;
    shouldShowFiltersSection: boolean;
}

class AppComponent extends Component<IProps, IState> {
    private executionRef = createRef<ExecutionComponent>();
    private teamSettingsModalRef = createRef<TeamSettingsModalComponent>();
    private addTeamMembersModalRef = createRef<AddTeamMembersModalComponent>();
    private userModalRef = createRef<UserSettingsModalComponent>();
    private stateChangeChan?: csp.PopChannel<IAppState | undefined>;

    constructor(props: any) {
        super(props);
        this.state = {
            isDrawerOpen: false,
            shouldShowFiltersSection: false,
            teams: [],
            activeTeamId: '-1',
        };
    }

    public render() {
        return (
            <div className={styles.App}>
                <Route router={this.props.deps.router} pathPattern={'/debug'}>
                    <DebugComponent
                        repoOwner={'teamyapp'}
                        repoName={'teamy-web'}
                    />
                </Route>
                <Route router={this.props.deps.router} pathPattern={'/'}>
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
                        {this.renderHeader()}
                        <div className={styles.PageOptionsSection}>
                            {this.state.shouldShowFiltersSection && (
                                <div className={styles.FilterListComponent}>
                                    <FilterListComponent
                                        deps={this.props.deps}
                                    />
                                </div>
                            )}
                        </div>
                        <div className={styles.Execution}>
                            {
                                <ExecutionComponent
                                    ref={this.executionRef}
                                    deps={this.props.deps}
                                />
                            }
                        </div>
                    </div>
                </Route>
                <TeamSettingsModalComponent
                    deps={this.props.deps}
                    ref={this.teamSettingsModalRef}
                    onAddTeamMemberClick={this.onAddTeamMembersClick}
                    onTeamUpdated={this.onTeamUpdated}
                />
                <AddTeamMembersModalComponent
                    deps={this.props.deps}
                    ref={this.addTeamMembersModalRef}
                    onTeamMembersAdded={this.onTeamMembersAdded}
                />
                <UserSettingsModalComponent
                    ref={this.userModalRef}
                    deps={this.props.deps}
                    onUserUpdated={this.onUserUpdated}
                />
            </div>
        );
    }

    public async componentDidMount() {
        this.stateChangeChan =
            this.props.deps.localStore.subscribeStateChange();
        (async () => {
            while (true) {
                console.log('waiting for localStore state changes');
                const state = await this.stateChangeChan!.pop();
                if (state === undefined) {
                    // check undefined instead of falsy because
                    // a falsy data could be valid data per channel's concern.
                    return;
                }
                this.updateState(state);
            }
        })().then();
    }

    public componentWillUnmount() {
        this.stateChangeChan?.close();
    }

    private renderHeader(): ReactElement {
        return (
            <header className={styles.Header}>
                <div className={styles.MenuButtonPlaceHolder}>
                    {!this.state.isDrawerOpen && (
                        <div
                            className={styles.MenuButton}
                            onClick={this.onMenuToggle}
                        >
                            <MaterialIconUI>menu</MaterialIconUI>
                        </div>
                    )}
                </div>
                <div className={styles.TeamName}>
                    {this.state.me?.activeTeam?.name}
                </div>
                <SpacerUI />
                <div className={styles.UserActionSection}>
                    <TooltipUI message={'Filters'}>
                        <div
                            className={`${styles.Action} ${classNames({
                                [styles.Active]:
                                    this.state.shouldShowFiltersSection,
                            })}`}
                            onClick={this.onFilterActionClick}
                        >
                            <MaterialIconUI>filter_alt</MaterialIconUI>
                        </div>
                    </TooltipUI>
                </div>
                {this.state.me && (
                    <div className={styles.UserSection}>
                        <div
                            className={styles.UserProfile}
                            onClick={this.onUserProfileClick}
                        >
                            <UserProfileUI user={this.state.me} />
                        </div>
                        <div className={styles.UserName}>
                            {`${this.state.me?.firstName} ${this.state.me?.lastName}`}
                        </div>
                    </div>
                )}
            </header>
        );
    }

    private onMenuToggle = () => {
        this.setState({
            isDrawerOpen: !this.state.isDrawerOpen,
        });
    };

    private onUserProfileClick = () => {
        this.userModalRef.current?.open(this.state.me!);
    };

    private onAddTeamMembersClick = (teamId: string) => {
        this.addTeamMembersModalRef.current?.open(teamId);
    };

    private onShowTeamMembersClick = (teamId: string) => {
        this.teamSettingsModalRef.current?.open(teamId, 1);
    };

    private onViewTeamSettings = (teamId: string) => {
        this.teamSettingsModalRef.current?.open(teamId);
    };

    private onActiveTeamSelect = (teamId: string): void => {
        this.props.deps.localStore.mutate({
            type: 'UpdateActiveTeam',
            teamId: `${teamId}`,
        });
    };

    private onTeamMembersAdded = async (teamId: string) => {
        await this.refresh('network-only');
        this.teamSettingsModalRef.current?.open(teamId, 1);
    };

    private onTeamUpdated = () => {
        this.refresh('network-only');
    };

    private onUserUpdated = () => {
        this.refresh('network-only');
    };

    private onFilterActionClick = () => {
        this.setState({
            shouldShowFiltersSection: !this.state.shouldShowFiltersSection,
        });
    };

    private async refresh(policy: FetchPolicy) {
        console.log('refresh App', policy);
        const data = await this.props.deps.pageService.fetchMePage(policy);
        const teams: Team[] = data.me?.teams;
        const activeTeamId = data.me?.activeTeam?.id;
        // TODO: We know that this is a hack. But in order to not hack, we need to get rid of refreshEvent first.
        this.props.deps.localStore.setState((state: IAppState) =>
            Object.assign<any, IAppState, Partial<IAppState>>({}, state, {
                currentUser: data.me,
                teams,
                activeTeamId,
            }),
        );
    }

    private updateState(state: IAppState) {
        this.setState({
            me: state.currentUser,
            teams: state.teams,
            activeTeamId: state.activeTeamId,
        });
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
    return <AppWithIdentityVerification deps={props.deps} />;
}
