import React, { Component, Fragment, createRef } from 'react';

import * as csp from '@lib/csp/csp';
import { IdentityClient } from '@lib/identity/Identity.client';
import { Route } from '@lib/router/Route';
import { RouteUpdate, Router } from '@lib/router/router';
import { ButtonUI } from '@lib/ui/Button';
import { DropDownList, Option } from '@lib/ui/DropDownList';

import {
    debugRoutePattern,
    executionTabRoutePattern,
    executionTaskRoutePattern,
    getTeamId,
    invitationRoutePattern,
    rootRoutePattern,
    signInFinishRoutePattern,
    signInRoutePattern,
    signUpRoutePattern,
    teamPath,
    teamRoutePattern,
} from '@core/config/routing';
import { Deps } from '@core/dep/deps';
import { TaskFilters } from '@core/entity/filters';
import { Team } from '@core/entity/team';
import { User } from '@core/entity/user';
import { UserActionEvent } from '@core/event/userAction';
import { GraphSource } from '@core/graph/graphSource';

import { CloudComponent } from '../cloud/Cloud.component';
import styles from './App.component.module.scss';
import { DebugComponent } from './Debug.component';
import { ExecutionComponent } from './Execution.component';
import { InvitationComponent } from './Invitation.component';
import { SignUpComponent, signUpRedirectKey } from './SignUp.component';
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

interface Props {
    deps: Deps;
}

interface State {
    me?: User;
    currentTeam?: Team;
    teams: Team[];
    activeTeamId?: number;
    isDrawerOpen: boolean;
    taskFilters: TaskFilters;
}

const publicRoutePatterns = [
    signInRoutePattern,
    signInFinishRoutePattern,
    debugRoutePattern,
];

const acceptedRoutePatterns = [
    debugRoutePattern,
    signUpRoutePattern,
    signInRoutePattern,
    signInFinishRoutePattern,
    teamRoutePattern,
    invitationRoutePattern,
    executionTabRoutePattern,
    executionTaskRoutePattern,
];

export class AppComponent extends Component<Props, State> {
    private readonly router: Router;
    private readonly graphSource: GraphSource;
    private readonly identityClient: IdentityClient;

    private readonly headerRef = createRef<HeaderComponent>();
    private readonly teamSettingsModalRef =
        createRef<TeamSettingsModalComponent>();
    private readonly addTeamMembersModalRef =
        createRef<AddTeamMembersModalComponent>();
    private readonly userModalRef = createRef<UserSettingsModalComponent>();
    private readonly createTeamModalRef = createRef<CreateTeamModalComponent>();

    private stateChangeChan?: csp.PopChannel<boolean | undefined>;
    private routeChangeChan?: csp.PopChannel<RouteUpdate | undefined>;
    private userActionChan?: csp.PopChannel<UserActionEvent | undefined>;

    constructor(props: Props) {
        super(props);
        this.router = props.deps.router;
        this.identityClient = props.deps.identityClient;
        this.graphSource = props.deps.graphSource;
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
                <CloudComponent deps={this.props.deps} />
                <Route router={this.router} pattern={signUpRoutePattern}>
                    <SignUpComponent deps={this.props.deps} />
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
                                currentTeam={this.state.currentTeam}
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
                />
                <AddTeamMembersModalComponent
                    deps={this.props.deps}
                    ref={this.addTeamMembersModalRef}
                    onTeamMembersAdded={this.onTeamMembersAdded}
                />
                <UserSettingsModalComponent
                    ref={this.userModalRef}
                    deps={this.props.deps}
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
        this.monitorStateChanges();
        this.monitorRouteChanges();
        this.monitorUserActions();
        this.userActionChan =
            this.props.deps.shortcutMonitor.subscribeUserAction();
    }

    public componentWillUnmount() {
        this.stateChangeChan?.close();
        this.routeChangeChan?.close();
        this.userActionChan?.close();
        this.props.deps.shortcutMonitor.dispose();
    }

    private monitorStateChanges() {
        this.stateChangeChan = this.graphSource.subscribeStateChange();
        (async () => {
            while (true) {
                console.log('waiting for localStore state changes');
                const hasChanged = await this.stateChangeChan!.pop();
                if (hasChanged === undefined) {
                    // check undefined instead of falsy because
                    // a falsy data could be valid data per channel's concern.
                    return;
                }

                this.updateState();
            }
        })().then();
    }

    private monitorRouteChanges() {
        this.router.registerRoute(rootRoutePattern, false);
        acceptedRoutePatterns.forEach((pattern: string) => {
            this.router.registerRoute(pattern, false);
        });
        this.routeChangeChan = this.router.subscribeRouteChange();
        console.log('[AppComponent]subscribing');
        (async () => {
            while (true) {
                const routeUpdate = await this.routeChangeChan!.pop();
                if (routeUpdate === undefined) {
                    return;
                }

                if (!publicRoutePatterns.includes(routeUpdate.routePattern)) {
                    const isSignedIn = await this.identityClient.isSignedIn();
                    if (!isSignedIn) {
                        this.identityClient.trySignIn();
                        continue;
                    } else {
                        await this.graphSource.syncCurrentUserWithTeams();
                        const me = this.graphSource.currentUser()?.id;
                        if (!me) {
                            this.trySignUp(routeUpdate.routePattern);
                            continue;
                        }
                    }
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

                const teamIdParam = getTeamId(routeUpdate.params);
                if (teamIdParam) {
                    const teamId = parseInt(teamIdParam);
                    if (this.state.activeTeamId !== teamId) {
                        this.onActiveTeamSelect(teamId);
                    } else {
                        await this.graphSource.syncCurrentTeam();
                    }
                }
            }
        })().then();
        this.router.navigateToCurrUri();
    }

    private monitorUserActions() {
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

    private renderNoActiveTeam() {
        const teamOptions: Option[] = this.state.teams.map((team) => ({
            key: `${team.id}`,
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
                                        onSelectOption={
                                            this.onActiveTeamOptionSelect
                                        }
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

    private onActiveTeamOptionSelect = (teamId: string) => {
        this.onActiveTeamSelect(parseInt(teamId));
    };

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

    private onAddTeamMembersClick = (teamId: number) => {
        this.addTeamMembersModalRef.current?.open(teamId, 0);
    };

    private onShowTeamMembersClick = (teamId: number) => {
        this.teamSettingsModalRef.current?.open(teamId, 1);
    };

    private onShowInvitationsClick = (teamId: number) => {
        this.teamSettingsModalRef.current?.open(teamId, 2);
    };

    private onViewTeamSettingsClick = (teamId: number) => {
        this.teamSettingsModalRef.current?.open(teamId);
    };

    private onCreateTeamClick = () => {
        this.createTeamModalRef.current?.open();
    };

    private onActiveTeamSelect = (teamId: number): void => {
        this.graphSource.setCurrentTeam(teamId);
    };

    private onTeamMembersAdded = async (teamId: number) => {
        this.teamSettingsModalRef.current?.open(teamId, 1);
    };

    private updateState() {
        const currentUser = this.graphSource.currentUser();
        const currTeam = this.graphSource.currentTeam();
        this.setState({
            me: currentUser,
            currentTeam: currTeam,
            teams: currentUser?.teams || [],
            activeTeamId: currTeam?.id,
        });

        this.tryRedirect(currTeam?.id);
    }

    private tryRedirect(activeTeamId?: number) {
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

    private trySignUp(currRoutePattern: string) {
        if (currRoutePattern === signUpRoutePattern) {
            return;
        }

        const currUrl = window.location.href;
        localStorage.setItem(signUpRedirectKey, currUrl);
        this.props.deps.router.navigateTo(signUpRoutePattern);
    }
}
