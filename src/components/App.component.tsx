import React, { Component, Fragment, ReactElement, createRef } from 'react';

import * as csp from '@lib/csp/csp';
import { WithIdentityVerification } from '@lib/identity/WithIdentityVerification';
import { Route } from '@lib/router/Route';
import { RouteUpdate, Router } from '@lib/router/router';
import { LocalStore } from '@lib/store/localStore';
import { ButtonUI } from '@lib/ui/Button';
import { DropDownList, Option } from '@lib/ui/DropDownList';

import {
    cloudRoutePattern,
    debugRoutePattern,
    getTeamId,
    invitationRoutePattern,
    rootRoutePattern, signInFinishRoutePattern, signInRoutePattern, signUpRoutePattern,
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

import { CloudComponent } from '../cloud/Cloud.component';
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
import { InvitationLinkCopiedFeedbackComponent } from './shared/feedbacks/InviationLinkCopiedFeedback.component';
import { TaskUpdatedFeedbackComponent } from './shared/feedbacks/TaskUpdatedFeedback.component';
import { TeamProfileUpdatedFeedbackComponent } from './shared/feedbacks/TeamProfileUpdatedFeedback.component';
import { UserProfileUpdatedFeedbackComponent } from './shared/feedbacks/UserProfileUpdatedFeedback.component';
import { SignUpComponent } from './SignUp.component';
import { WithSignUp } from './WithSignUp.component';

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
    signUpRoutePattern,
    signInRoutePattern,
    signInFinishRoutePattern,
    teamRoutePattern,
    invitationRoutePattern,
];

class AppComponent extends Component<Props, State> {
    private readonly router: Router;
    private readonly localStore: LocalStore<IAppState, MutationEvent>;
    private readonly headerRef = createRef<HeaderComponent>();
    private readonly teamSettingsModalRef =
        createRef<TeamSettingsModalComponent>();
    private readonly addTeamMembersModalRef =
        createRef<AddTeamMembersModalComponent>();
    private readonly userModalRef = createRef<UserSettingsModalComponent>();
    private readonly createTeamModalRef = createRef<CreateTeamModalComponent>();

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
                <Route router={this.router} pattern={cloudRoutePattern}>
                    <CloudComponent deps={this.props.deps} />
                </Route>
                <Route router={this.router} pattern={signUpRoutePattern}>
                    <SignUpComponent deps={this.props.deps}/>
                </Route>
                {this.state.me && (
                    <Fragment>
                        <DrawerUI
                            activeTeamId={this.state.activeTeamId}
                            teams={this.state.teams}
                            isDrawerOpen={this.state.isDrawerOpen}
                            onMenuClose={this.onMenuToggle}
                            onActiveTeamSelect={this.onActiveTeamSelect}
                            onAddTeamMembersClick={this.onAddTeamMembersClick}
                            onShowTeamMembersClick={this.onShowTeamMembersClick}
                            onShowInvitationsClick={this.onShowInvitationsClick}
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
                                onTaskFiltersChange={this.onTaskFiltersChange}
                            />
                            {this.state.activeTeamId ? (
                                <Route
                                    router={this.router}
                                    pattern={teamRoutePattern}
                                >
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
                                </Route>
                            ) : (
                                this.renderNoActiveTeam()
                            )}
                        </div>
                    </Fragment>
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
                <TaskUpdatedFeedbackComponent deps={this.props.deps} />
                <UserProfileUpdatedFeedbackComponent deps={this.props.deps} />
                <TeamProfileUpdatedFeedbackComponent deps={this.props.deps} />
                <InvitationLinkCopiedFeedbackComponent deps={this.props.deps} />
            </div>
        );
    }

    public async componentDidMount() {
        const me = await this.props.deps.userService.fetchMe('network-only');
        if (!me) {
            return;
        }

        await this.props.deps.networkStateSyncer.syncState();
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
                if (teamId && this.state.activeTeamId !== teamId) {
                    this.onActiveTeamSelect(teamId);
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
        })().then();
    }

    public componentWillUnmount() {
        this.stateChangeChan?.close();
        this.routeChangeChan?.close();
        this.userActionChan?.close();
        this.props.deps.shortcutMonitor.dispose();
    }

    private renderNoActiveTeam() {
        const teamOptions: Option[] = this.state.teams.map((team) => ({
            key: team.id,
            description: team.name,
        }));
        return (
            <div className={styles.NoTeamSelected}>
                <div className={styles.Center}>
                    {teamOptions.length > 0 && (
                        <Fragment>
                            <div className={styles.SelectActiveTeam}>
                                <div className={styles.Description}>
                                    Please select active team
                                </div>
                                <div className={styles.DropDown}>
                                    <DropDownList
                                        options={teamOptions}
                                        onSelectOption={this.onActiveTeamSelect}
                                    />
                                </div>
                            </div>
                            <div className={styles.OrDivider}>Or</div>
                        </Fragment>
                    )}
                    <div className={styles.Actions}>
                        <div
                            className={`${styles.Action} ${styles.CreateTeam}`}
                        >
                            <ButtonUI
                                label={'Create a New Team'}
                                onClick={this.onCreateTeamClick}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
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

interface HookProps {
    deps: Deps;
}

export default function AppComponentHook(props: HookProps): ReactElement {
    props.deps.router.registerRoute(rootRoutePattern);
    for (const routePattern of acceptedRoutePatterns) {
        props.deps.router.registerRoute(routePattern, false);
    }

    const AppWithIdentityVerification = WithIdentityVerification(
        props.deps.identityClient,
        props.deps.router,
        signInRoutePattern,
        signInFinishRoutePattern,
        WithSignUp(props.deps, AppComponent),
    );
    return <AppWithIdentityVerification deps={props.deps} />;
}
