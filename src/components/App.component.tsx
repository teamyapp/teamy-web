import { CloudComponent } from '@cloud/Cloud.component';
import classNames from 'classnames';
import React, { Component, Fragment, createRef } from 'react';

import * as csp from '@lib/csp/csp';
import { IdentityClient } from '@lib/identity/Identity.client';
import { Route } from '@lib/router/Route';
import { RouteUpdate, Router } from '@lib/router/router';
import { ButtonUI } from '@lib/ui/Button';
import { DropDownList, Option } from '@lib/ui/DropDownList';
import { BoundingBoxFinder } from '@lib/ui/position';

import {
    debugRoutePattern,
    getTaskId,
    getTeamId,
    invitationRoutePattern,
    rootRoutePattern,
    signInFinishRoutePattern,
    signInRoutePattern,
    signUpRoutePattern,
    sprintTabRoutePattern,
    sprintsPath,
    sprintsRoutePattern,
    taskPath,
    taskRoutePattern,
} from '@core/config/routing';
import { Deps } from '@core/dep/deps';
import { TaskFilters } from '@core/entity/filters';
import { UpdateTaskInput } from '@core/entity/input';
import { Team } from '@core/entity/team';
import { User } from '@core/entity/user';
import { UserActionEvent } from '@core/event/userAction';
import { GraphSource } from '@core/storage/graph/graphSource';
import { LocalStore } from '@core/storage/syncer/localStore';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import styles from './App.component.module.scss';
import { BacklogComponent } from './internal/Backlog.component';
import { DrawerUI } from './internal/Drawer';
import { HeaderComponent } from './internal/Header.component';
import { AddTeamMembersModalComponent } from './internal/Modals/AddTeamMembersModal.component';
import { CreateTeamModalComponent } from './internal/Modals/CreateTeamModal.component';
import { TaskDetailModalComponent } from './internal/Modals/TaskDetailModal.component';
import { TeamSettingsModalComponent } from './internal/Modals/TeamSettingsModal.component';
import { UserSettingsModalComponent } from './internal/Modals/UserSettingsModal.component';
import { SelectTaskOwnersPopupComponent } from './internal/SelectTaskOwnersPopupComponent';
import { InvitationLinkCopiedFeedbackComponent } from './internal/feedbacks/InviationLinkCopiedFeedback.component';
import { TaskUpdatedFeedbackComponent } from './internal/feedbacks/TaskUpdatedFeedback.component';
import { TeamProfileUpdatedFeedbackComponent } from './internal/feedbacks/TeamProfileUpdatedFeedback.component';
import { UserProfileUpdatedFeedbackComponent } from './internal/feedbacks/UserProfileUpdatedFeedback.component';
import { DebugComponent } from './pages/Debug.component';
import { InvitationComponent } from './pages/Invitation.component';
import { SignUpComponent, signUpRedirectKey } from './pages/SignUp.component';
import { SprintsComponent } from './pages/Sprints.component';

interface Props {
    deps: Deps;
}

interface State {
    showMainContent: boolean;
    showBackground: boolean;
    showPrivatePage: boolean;
    me?: User;
    currentTeam?: Team;
    teams: Team[];
    activeTeamId?: number;
    isDrawerOpen: boolean;
    showBacklog: boolean;
    taskFilters: TaskFilters;
    selectOwnerTaskId?: number;
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
    sprintsRoutePattern,
    invitationRoutePattern,
    sprintTabRoutePattern,
    taskRoutePattern,
];

export class AppComponent extends Component<Props, State> {
    private readonly router: Router;
    private readonly localStore: LocalStore;
    private readonly graphSource: GraphSource;
    private readonly stateSyncer: StateSyncer;
    private readonly identityClient: IdentityClient;

    private readonly headerRef = createRef<HeaderComponent>();
    private readonly selectTaskOwnersPopupRef =
        createRef<SelectTaskOwnersPopupComponent>();
    private readonly taskDetailModalRef = createRef<TaskDetailModalComponent>();
    private readonly teamSettingsModalRef =
        createRef<TeamSettingsModalComponent>();
    private readonly addTeamMembersModalRef =
        createRef<AddTeamMembersModalComponent>();
    private readonly userModalRef = createRef<UserSettingsModalComponent>();
    private readonly createTeamModalRef = createRef<CreateTeamModalComponent>();
    private readonly backlogRef = createRef<BacklogComponent>();

    private stateChangeChan?: csp.PopChannel<boolean | undefined>;
    private routeChangeChan?: csp.PopChannel<RouteUpdate | undefined>;
    private userActionChan?: csp.PopChannel<UserActionEvent | undefined>;

    constructor(props: Props) {
        super(props);
        this.router = props.deps.router;
        this.identityClient = props.deps.identityClient;
        this.localStore = props.deps.localStore;
        this.graphSource = props.deps.graphSource;
        this.stateSyncer = props.deps.stateSyncer;
        this.state = {
            showBacklog: false,
            showMainContent: false,
            showBackground: false,
            showPrivatePage: false,
            isDrawerOpen: false,
            teams: [],
            taskFilters: {},
        };
    }

    public render() {
        return (
            <div className={`${styles.App} ${classNames({
                [styles.ShowBackground]: this.state.showBackground
            })}`}>
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
                {this.state.showPrivatePage && this.state.me && (
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
                                onBacklogToggle={this.onBacklogToggle}
                            />
                            {this.state.showMainContent &&
                                (this.state.activeTeamId ? (
                                    <div className={styles.Team}>
                                        <div
                                            className={`${
                                                styles.Sidebar
                                            } ${classNames({
                                                [styles.Shown]:
                                                    this.state.showBacklog,
                                            })}`}
                                        >
                                            <div className={styles.Backlog}>
                                                <BacklogComponent
                                                    ref={this.backlogRef}
                                                    deps={this.props.deps}
                                                    onShowPotentialTaskOwners={
                                                        this
                                                            .onShowPotentialTaskOwners
                                                    }
                                                    onViewTaskDetail={
                                                        this.onViewTaskDetail
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className={styles.Content}>
                                            <Route
                                                router={this.router}
                                                pattern={sprintsRoutePattern}
                                            >
                                                <SprintsComponent
                                                    deps={this.props.deps}
                                                    taskFilters={
                                                        this.state.taskFilters
                                                    }
                                                    onShowPotentialTaskOwners={
                                                        this
                                                            .onShowPotentialTaskOwners
                                                    }
                                                    onViewTaskDetail={
                                                        this.onViewTaskDetail
                                                    }
                                                />
                                            </Route>
                                        </div>
                                    </div>
                                ) : (
                                    this.renderNoActiveTeam()
                                ))}
                        </div>
                    </Fragment>
                )}
                <Route router={this.router} pattern={invitationRoutePattern}>
                    <InvitationComponent deps={this.props.deps} />
                </Route>
                <TaskDetailModalComponent
                    ref={this.taskDetailModalRef}
                    deps={this.props.deps}
                    selectOwnerTaskId={this.state.selectOwnerTaskId}
                    onClose={this.onTaskDetailModalClose}
                    onShowPotentialTaskOwners={this.onShowPotentialTaskOwners}
                />
                <SelectTaskOwnersPopupComponent
                    ref={this.selectTaskOwnersPopupRef}
                    deps={this.props.deps}
                    onClose={this.onTaskOwnersPopupClose}
                />
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
        this.stateChangeChan = this.localStore.subscribeStateChange();
        (async () => {
            while (true) {
                console.log('[AppComponent] waiting for state changes');
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
        console.log('[AppComponent] subscribing');
        (async () => {
            while (true) {
                const routeUpdate = await this.routeChangeChan!.pop();
                if (routeUpdate === undefined) {
                    return;
                }

                if (publicRoutePatterns.includes(routeUpdate.routePattern)) {
                    continue;
                }

                const isSignedIn = await this.identityClient.isSignedIn();
                this.setState({
                    showPrivatePage: isSignedIn,
                });
                if (!isSignedIn) {
                    this.identityClient.trySignIn();
                    continue;
                }

                await this.stateSyncer.pullCurrentUserWithTeams();
                const me = this.graphSource.currentUser()?.id;
                if (!me) {
                    this.trySignUp(routeUpdate.routePattern);
                    continue;
                }

                await this.stateSyncer.ensureConnected();
                const currTeamId = this.graphSource.currentTeam()?.id;
                if (!acceptedRoutePatterns.includes(routeUpdate.routePattern)) {
                    this.tryRedirect(currTeamId);
                    console.log(
                        '[AppComponent] discarded',
                        routeUpdate.routePattern,
                        routeUpdate.suffix,
                        routeUpdate.params.pathParams,
                    );
                    continue;
                }

                console.log(
                    '[AppComponent] accepted',
                    routeUpdate.routePattern,
                    routeUpdate.suffix,
                    routeUpdate.params.pathParams,
                );
                const teamIdParam = getTeamId(routeUpdate.params);
                if (!teamIdParam) {
                    continue;
                }

                const teamId = parseInt(teamIdParam);
                if (teamId !== currTeamId) {
                    await this.onActiveTeamSelect(teamId);
                }

                if (this.graphSource.currentTeam()) {
                    this.stateSyncer.pullCurrentTeam().then();
                } else {
                    this.router.navigateTo(rootRoutePattern);
                }

                const taskIdParam = getTaskId(routeUpdate.params);
                if (taskIdParam) {
                    const taskId = parseInt(taskIdParam);
                    if (isNaN(taskId)) {
                        this.tryRedirect(teamId);
                        continue;
                    }

                    this.onViewTaskDetail(taskId);
                    this.setState({
                        showBackground: true
                    })
                    continue;
                }

                this.setState({
                    showMainContent: true,
                });
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
        this.onActiveTeamSelect(parseInt(teamId), true).then();
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

    private onActiveTeamSelect = async (
        teamId: number,
        notifyRouteChange: boolean = false,
    ): Promise<void> => {
        const prevActiveTeamId = this.graphSource.currentTeam()?.id;
        if (this.stateSyncer.trySetCurrentTeam(teamId)) {
            await this.stateSyncer.pullCurrentTeam();
            this.router.navigateTo(sprintsPath(teamId), {
                notifyRouteChange: notifyRouteChange,
            });
            return;
        }

        if (prevActiveTeamId) {
            this.stateSyncer.trySetCurrentTeam(prevActiveTeamId);
            this.router.navigateTo(sprintsPath(prevActiveTeamId), {
                notifyRouteChange: false,
            });
        }
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
    }

    private tryRedirect(activeTeamId?: number) {
        if (activeTeamId) {
            this.router.navigateTo(sprintsPath(activeTeamId));
        } else {
            this.router.navigateTo(rootRoutePattern);
            this.setState({
                showMainContent: true,
            });
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

    private onBacklogToggle = () => {
        if (!this.state.showBacklog) {
            this.backlogRef.current?.refresh();
        }

        this.setState({
            showBacklog: !this.state.showBacklog,
        });
    };

    private onShowPotentialTaskOwners = (
        taskId: number,
        updateTaskInput: UpdateTaskInput,
        findAlignTargetBoundBox: BoundingBoxFinder,
        selectedOwnerId?: number,
    ) => {
        this.selectTaskOwnersPopupRef.current?.show.call(
            null,
            taskId,
            updateTaskInput,
            findAlignTargetBoundBox,
            selectedOwnerId,
        );
        this.setState({
            selectOwnerTaskId: taskId,
        });
    };

    private onTaskOwnersPopupClose = () => {
        this.setState({
            selectOwnerTaskId: undefined,
        });
    };

    private onViewTaskDetail = (taskId: number) => {
        this.taskDetailModalRef.current?.open(taskId);
        if (this.state.activeTeamId) {
            this.router.navigateTo(taskPath(this.state.activeTeamId, taskId), {
                notifyRouteChange: false,
            });
        }
    };

    private onTaskDetailModalClose = () => {
        const teamIdParam = getTeamId(this.router.currentRouteUpdate.params);
        if (teamIdParam) {
            const teamId = parseInt(teamIdParam);
            this.router.navigateTo(sprintsPath(teamId));
        }
    };
}
