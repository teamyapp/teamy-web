import React, { Component, Fragment, ReactElement, createRef } from 'react';

import * as csp from '@lib/csp/csp';
import { WithIdentityVerification } from '@lib/identity/withIdentityVerification';
import { Route } from '@lib/router/Route';
import { RouteUpdate, Router } from '@lib/router/router';
import { LocalStore } from '@lib/store/localStore';

import {
    debugRoutePattern,
    getTeamId,
    identityRoutePattern,
    invitationRoutePattern,
    rootRoutePattern,
    signInPath,
    teamPath,
    teamRoutePattern,
} from '@core/config/routing';
import { Deps } from '@core/dep/deps';
import { TaskFilters } from '@core/entity/filters';
import { Team } from '@core/entity/team';
import { User } from '@core/entity/user';
import { MutationEvent } from '@core/event/mutation';
import { UserActionEvent } from '@core/event/userAction';
import { IAppState } from '@core/state/state';

import styles from './App.component.module.scss';
import { DebugComponent } from './Debug.component';
import { ExecutionComponent } from './Execution.component';
import { InvitationComponent } from './Invitation.component';
import { DrawerUI } from './shared/Drawer';
import { HeaderComponent } from './shared/Header.component';
import { AddTeamMembersModalComponent } from './shared/Modals/AddTeamMembersModal.component';
import { CreateTeamModalComponent } from './shared/Modals/CreateTeamModal.component';
import { TeamSettingsModalComponent } from './shared/Modals/TeamSettingsModal.component';
import { UserSettingsModalComponent } from './shared/Modals/UserSettingsModal.component';

interface Props {
    deps: Deps;
}

interface State {
    me?: User;
    teams: Team[];
    activeTeamId?: string;
    isDrawerOpen: boolean;
    taskFilters: TaskFilters;
}

const acceptedRoutePatterns = [
    debugRoutePattern,
    teamRoutePattern,
    invitationRoutePattern,
];

class AppComponent extends Component<Props, State> {
    private readonly router: Router;
    private readonly localStore: LocalStore<IAppState, MutationEvent>;
    private readonly teamSettingsModalRef =
        createRef<TeamSettingsModalComponent>();
    private readonly addTeamMembersModalRef =
        createRef<AddTeamMembersModalComponent>();
    private readonly userModalRef = createRef<UserSettingsModalComponent>();
    private readonly createTeamModalRef = createRef<CreateTeamModalComponent>();
    private readonly headerRef = createRef<HeaderComponent>();
    private stateChangeChan?: csp.PopChannel<IAppState | undefined>;
    private routeChangeChan?: csp.PopChannel<RouteUpdate | undefined>;
    private userActionChan?: csp.PopChannel<UserActionEvent | undefined>;

    constructor(props: Props) {
        super(props);
        this.router = props.deps.router;
        this.localStore = props.deps.localStore;
        this.state = {
            isDrawerOpen: false,
            teams: [],
            taskFilters: {},
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
                {this.state.me && (
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
                                onShowInvitationsClick={
                                    this.onShowInvitationsClick
                                }
                                onViewTeamSettingsClick={
                                    this.onViewTeamSettingsClick
                                }
                                onCreateTeamClick={this.onCreateTeamClick}
                            />
                            <div className={styles.Content}>
                                <HeaderComponent
                                    deps={this.props.deps}
                                    ref={this.headerRef}
                                    me={this.state.me}
                                    isDrawerOpen={this.state.isDrawerOpen}
                                    taskFilters={this.state.taskFilters}
                                    onMenuToggle={this.onMenuToggle}
                                    onUserProfileClick={this.onUserProfileClick}
                                    onTaskFiltersChange={
                                        this.onTaskFiltersChange
                                    }
                                />

                                {this.state.activeTeamId ? (
                                    <div className={styles.Execution}>
                                        {
                                            <ExecutionComponent
                                                deps={this.props.deps}
                                                teamId={this.state.activeTeamId}
                                                taskFilters={
                                                    this.state.taskFilters
                                                }
                                            />
                                        }
                                    </div>
                                ) : (
                                    <div>Please select default team.</div>
                                )}
                            </div>
                        </Fragment>
                    </Route>
                )}
                <Route router={this.router} pattern={invitationRoutePattern}>
                    <InvitationComponent deps={this.props.deps} />
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
                <CreateTeamModalComponent
                    ref={this.createTeamModalRef}
                    deps={this.props.deps}
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
        this.props.deps.networkStateSyncer.syncState();

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
                    this.tryRedirect(this.state.activeTeamId);
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

        this.userActionChan =
            this.props.deps.shortcutMonitor.subscribeUserAction();
        (async () => {
            while (true) {
                const userAction = await this.userActionChan?.pop();
                if (userAction === undefined) {
                    return;
                }

                this.processUserAction(userAction);
            }
        })();
    }

    public componentWillUnmount() {
        this.stateChangeChan?.close();
        this.routeChangeChan?.close();
        this.userActionChan?.close();
        this.props.deps.shortcutMonitor.dispose();
    }

    private onTaskFiltersChange = (taskFilters: TaskFilters) => {
        this.setState({
            taskFilters,
        });
    };

    private onMenuToggle = () => {
        this.setState({
            isDrawerOpen: !this.state.isDrawerOpen,
        });
    };

    private onUserProfileClick = () => {
        this.userModalRef.current?.open(this.state.me!);
    };

    private onAddTeamMembersClick = (teamId: string) => {
        this.addTeamMembersModalRef.current?.open(teamId, 0);
    };

    private onShowTeamMembersClick = (teamId: string) => {
        this.teamSettingsModalRef.current?.open(teamId, 1);
    };

    private onShowInvitationsClick = (teamId: string) => {
        this.teamSettingsModalRef.current?.open(teamId, 2);
    };

    private onViewTeamSettingsClick = (teamId: string) => {
        this.teamSettingsModalRef.current?.open(teamId);
    };

    private onCreateTeamClick = () => {
        this.createTeamModalRef.current?.open();
    };

    private onActiveTeamSelect = (teamId: string): void => {
        this.localStore.mutate({
            type: 'UpdateActiveTeam',
            teamId: `${teamId}`,
        });
    };

    private onTeamMembersAdded = async (teamId: string) => {
        this.props.deps.networkStateSyncer.syncState();
        this.teamSettingsModalRef.current?.open(teamId, 1);
    };

    private onTeamUpdated = () => {
        this.props.deps.networkStateSyncer.syncState();
    };

    private onUserUpdated = () => {
        this.props.deps.networkStateSyncer.syncState();
    };

    private updateState(state: IAppState) {
        this.setState({
            me: state.currentUser,
            teams: state.teams,
            activeTeamId: state.activeTeamId,
        });

        this.tryRedirect(state.activeTeamId);
    }

    private tryRedirect(activeTeamId?: string) {
        if (!activeTeamId) {
            return;
        }

        const isAcceptedPattern = acceptedRoutePatterns.includes(
            this.router.currentRouteUpdate?.routePattern,
        );

        const teamId = getTeamId(this.router.currentRouteUpdate?.params);
        if (!isAcceptedPattern && !teamId) {
            this.router.navigateTo(teamPath(activeTeamId));
        }
    }

    private processUserAction(userAction: UserActionEvent) {
        switch (userAction) {
            case 'findKeyword':
                this.headerRef.current?.toggleSearchInputFocus();
                break;
        }
    }
}

interface IHookProps {
    deps: Deps;
}

export default function AppComponentHook(props: IHookProps): ReactElement {
    props.deps.router.registerRoute(rootRoutePattern);
    props.deps.router.registerRoute(identityRoutePattern);
    for (const routePattern of acceptedRoutePatterns) {
        props.deps.router.registerRoute(routePattern, false);
    }

    const AppWithIdentityVerification = WithIdentityVerification(
        props.deps.identityClient,
        props.deps.router,
        signInPath,
        AppComponent,
    );
    return <AppWithIdentityVerification deps={props.deps} />;
}
