import { FetchPolicy } from '@apollo/client';
import classNames from 'classnames';
import React, { Component, Fragment, ReactElement, createRef } from 'react';

import * as csp from '@lib/csp/csp';
import { WithIdentityVerification } from '@lib/identity/withIdentityVerification';
import { Route } from '@lib/router/Route';
import { RouteUpdate, Router } from '@lib/router/router';
import { LocalStore } from '@lib/store/localStore';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { SpacerUI } from '@lib/ui/Spacer';
import { TooltipUI } from '@lib/ui/Tooltip';

import { Deps } from '@core/dep/deps';
import { MutationEvent } from '@core/entity/events';
import { Team } from '@core/entity/team';
import { User } from '@core/entity/user';
import { IAppState } from '@core/state/state';

import styles from './App.component.module.scss';
import { DebugComponent } from './Debug.component';
import { ExecutionComponent } from './Execution.component';
import {
    debugRoutePattern,
    getTeamId,
    identityRoutePattern,
    signInPath,
    teamPath,
    teamRoutePattern,
} from './routing';
import { DrawerUI } from './shared/Drawer';
import { FilterListComponent } from './shared/FilterList.component';
import { AddTeamMembersModalComponent } from './shared/Modals/AddTeamMembersModal.component';
import { TeamSettingsModalComponent } from './shared/Modals/TeamSettingsModal.component';
import { UserSettingsModalComponent } from './shared/Modals/UserSettingsModal.component';
import { UserProfileUI } from './shared/UserProfile';

interface Props {
    deps: Deps;
}

interface State {
    me?: User;
    teams: Team[];
    activeTeamId?: string;
    isDrawerOpen: boolean;
    shouldShowFiltersSection: boolean;
}

const acceptedRoutePatterns = [teamRoutePattern, debugRoutePattern];

class AppComponent extends Component<Props, State> {
    private readonly router: Router;
    private readonly localStore: LocalStore<IAppState, MutationEvent>;
    private teamSettingsModalRef = createRef<TeamSettingsModalComponent>();
    private addTeamMembersModalRef = createRef<AddTeamMembersModalComponent>();
    private userModalRef = createRef<UserSettingsModalComponent>();
    private stateChangeChan?: csp.PopChannel<IAppState | undefined>;
    private routeChangeChan?: csp.PopChannel<RouteUpdate | undefined>;

    constructor(props: Props) {
        super(props);
        this.router = props.deps.router;
        this.localStore = props.deps.localStore;
        this.state = {
            isDrawerOpen: false,
            shouldShowFiltersSection: false,
            teams: [],
        };
    }

    public render() {
        return (
            <div className={styles.App}>
                <Route router={this.router} pattern={debugRoutePattern}>
                    <DebugComponent
                        repoOwner={'teamyapp'}
                        repoName={'teamy-web'}
                    />
                </Route>
                {this.state.activeTeamId && (
                    <Route router={this.router} pattern={teamRoutePattern}>
                        <Fragment>
                            <DrawerUI
                                activeTeamId={this.state.activeTeamId}
                                teams={this.state.teams}
                                isDrawerOpen={this.state.isDrawerOpen}
                                onMenuClose={this.onMenuToggle}
                                onActiveTeamSelect={this.onActiveTeamSelect}
                                onAddTeamMembersClick={
                                    this.onAddTeamMembersClick
                                }
                                onShowTeamMembersClick={
                                    this.onShowTeamMembersClick
                                }
                                onViewTeamSettings={this.onViewTeamSettings}
                            />
                            <div className={styles.Content}>
                                {this.renderHeader()}
                                <div className={styles.PageOptionsSection}>
                                    {this.state.shouldShowFiltersSection && (
                                        <div
                                            className={
                                                styles.FilterListComponent
                                            }
                                        >
                                            <FilterListComponent
                                                deps={this.props.deps}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className={styles.Execution}>
                                    {
                                        <ExecutionComponent
                                            teamId={this.state.activeTeamId}
                                            deps={this.props.deps}
                                        />
                                    }
                                </div>
                            </div>
                        </Fragment>
                    </Route>
                )}
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

    public componentDidMount() {
        this.stateChangeChan = this.localStore.subscribeStateChange();
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

        for (const routePattern of acceptedRoutePatterns) {
            this.router.registerRoute(routePattern, false);
        }
        this.router.navigateToCurrUri();
        this.routeChangeChan = this.router.subscribeRouteChange();
        console.log('[AppComponent]subscribing');
        (async () => {
            while (true) {
                const routeUpdate = await this.routeChangeChan!.pop();
                if (routeUpdate === undefined) {
                    return;
                }

                if (!acceptedRoutePatterns.includes(routeUpdate.routePattern)) {
                    console.log(
                        '[AppComponent][Discarded]',
                        routeUpdate.routePattern,
                        routeUpdate.suffix,
                        routeUpdate.params.pathParams,
                    );
                    continue;
                }

                console.log(
                    '[AppComponent][Accepted]',
                    routeUpdate.routePattern,
                    routeUpdate.suffix,
                    routeUpdate.params.pathParams,
                );

                const teamId = getTeamId(routeUpdate.params);
                if (teamId) {
                    this.setState({
                        activeTeamId: teamId,
                    });
                }
            }
        })().then();
    }

    public componentWillUnmount() {
        this.stateChangeChan?.close();
        this.routeChangeChan?.close();
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
        this.localStore.mutate({
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
        // TODO: We know that this is a hack. But in order to not hack, we need to get rid of refreshEvent first.
        this.localStore.setState((state: IAppState) =>
            Object.assign<any, IAppState, Partial<IAppState>>({}, state, {
                currentUser: data.me,
                teams,
            }),
        );
    }

    private updateState(state: IAppState) {
        this.setState({
            me: state.currentUser,
            teams: state.teams,
            activeTeamId: state.activeTeamId,
        });

        const isAcceptedPattern = acceptedRoutePatterns.includes(
            this.router.currentRouteUpdate?.routePattern,
        );
        const teamId = getTeamId(this.router.currentRouteUpdate?.params);
        if (!isAcceptedPattern && !teamId) {
            this.router.navigateTo(teamPath(state.activeTeamId));
        }
    }
}

interface IHookProps {
    deps: Deps;
}

export default function AppComponentHook(props: IHookProps): ReactElement {
    props.deps.router.registerRoute(identityRoutePattern);
    const AppWithIdentityVerification = WithIdentityVerification(
        props.deps.identityClient,
        props.deps.router,
        signInPath,
        AppComponent,
    );
    return <AppWithIdentityVerification deps={props.deps} />;
}
