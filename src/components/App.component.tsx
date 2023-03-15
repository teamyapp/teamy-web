import { CloudComponent } from '@cloud/Cloud.component';
import { Extension, ExtensionRuntime } from '@teamyapp/ext';
import classNames from 'classnames';
import React, { Component, , createRef } from 'react';

import * as csp from '@lib/csp/csp';
import { closeIfNot } from '@lib/csp/lib';
import { DragAndDropEvent } from '@lib/dragAndDrop/DragAndDropController';
import { TeamyExtensionRuntime } from '@lib/ext/runtime';
import { IdentityClient } from '@lib/identity/Identity.client';
import { Route } from '@lib/router/Route';
import { Router } from '@lib/router/router';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { DragAndDropContext } from '@core/config/dragAndDrop';
import { draggableTask } from '@core/config/draggable';
import {
    awaitingSectionId,
    backlogSectionId,
    deliveredSectionId,
    inProgressSectionId,
    needAttentionSectionId,
    upcomingSectionId,
} from '@core/config/sections';
import { Deps } from '@core/dep/deps';
import { TaskFilters } from '@core/entity/filters';
import { Task } from '@core/entity/task';
import { Team } from '@core/entity/team';
import { User } from '@core/entity/user';
import { UserActionEvent } from '@core/event/userAction';
import {
    debugRoutePattern,
    getTeamId,
    helpCenterPath,
    insightsPath,
    insightsRoutePattern,
    invitationRoutePattern,
    knowledgePath,
    planningPath,
    planningRoutePattern,
    rootRoutePattern,
    signUpRoutePattern,
    sprintsPath,
    sprintsRoutePattern,
    taskPath,
} from '@core/routing/routes';
import { GraphSource } from '@core/storage/graph/graphSource';
import { LocalStore } from '@core/storage/syncer/localStore';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import styles from './App.component.module.scss';
import { BacklogComponent } from './internal/Backlog.component';
import { DrawerUI } from './internal/Drawer';
import { HeaderComponent } from './internal/Header.component';
import { AddTeamMembersModalComponent } from './internal/Modals/AddTeamMembersModal.component';
import { CreateSprintModalComponent } from './internal/Modals/CreateSprintModal.component';
import { CreateTeamModalComponent } from './internal/Modals/CreateTeamModal.component';
import {
    RequiredAction,
    RequiredActionsModalComponent,
} from './internal/Modals/RequiredActionsModal.component';
import { TaskDetailModalComponent } from './internal/Modals/TaskDetailModal.component';
import { TeamSettingsModalComponent } from './internal/Modals/TeamSettingsModal.component';
import { UserSettingsModalComponent } from './internal/Modals/UserSettingsModal.component';
import { InvitationLinkCopiedFeedbackComponent } from './internal/feedbacks/InviationLinkCopiedFeedback.component';
import { TaskUpdatedFeedbackComponent } from './internal/feedbacks/TaskUpdatedFeedback.component';
import { TeamProfileUpdatedFeedbackComponent } from './internal/feedbacks/TeamProfileUpdatedFeedback.component';
import { UserProfileUpdatedFeedbackComponent } from './internal/feedbacks/UserProfileUpdatedFeedback.component';
import { DebugComponent } from './pages/Debug.component';
import { InsightsComponent } from './pages/Insights.component';
import { InvitationComponent } from './pages/Invitation.component';
import { PlanningComponent } from './pages/Planning.component';
import { SignUpComponent } from './pages/SignUp.component';
import { SprintsComponent } from './pages/Sprints.component';

const sectionIds = [
    backlogSectionId,
    upcomingSectionId,
    inProgressSectionId,
    awaitingSectionId,
    deliveredSectionId,
    needAttentionSectionId,
];

interface Props {
    deps: Deps;
}

interface State {
    // showMainContent: boolean;
    // showBackground: boolean;
    // showPrivatePage: boolean;
    me?: User;
    currentTeam?: Team;
    teams: Team[];
    activeTeamId?: number;
    isDrawerOpen: boolean;
    showBacklog: boolean;
    backlogDropReceiverLayer: number;
    taskFilters: TaskFilters;
}

export class AppComponent extends Component<Props, State> {
    private readonly router: Router;
    private readonly localStore: LocalStore;
    private readonly graphSource: GraphSource;
    private readonly stateSyncer: StateSyncer;
    private readonly identityClient: IdentityClient;

    private readonly headerRef = createRef<HeaderComponent>();
    private readonly taskDetailModalRef = createRef<TaskDetailModalComponent>();
    private readonly teamSettingsModalRef =
        createRef<TeamSettingsModalComponent>();
    private readonly addTeamMembersModalRef =
        createRef<AddTeamMembersModalComponent>();
    private readonly userModalRef = createRef<UserSettingsModalComponent>();
    private readonly createTeamModalRef = createRef<CreateTeamModalComponent>();
    private readonly createSprintModalRef =
        createRef<CreateSprintModalComponent>();
    private readonly requiredActionsModalRef =
        createRef<RequiredActionsModalComponent>();
    private readonly backlogRef = createRef<BacklogComponent>();

    private stateChangeChan?: csp.PopChannel<boolean | undefined>;
    private userActionChan?: csp.PopChannel<UserActionEvent | undefined>;
    private dragAndDropEventChan?: csp.PopChannel<
        DragAndDropEvent<DragAndDropContext> | undefined
    >;

    private extensions: Extension[] = [];

    constructor(props: Props) {
        super(props);
        this.router = props.deps.router;
        this.identityClient = props.deps.identityClient;
        this.localStore = props.deps.localStore;
        this.graphSource = props.deps.graphSource;
        this.stateSyncer = props.deps.stateSyncer;
        this.state = {
            showBacklog: false,
            // showMainContent: false,
            // showBackground: false,
            // showPrivatePage: false,
            isDrawerOpen: false,
            teams: [],
            taskFilters: {},
            backlogDropReceiverLayer: -1,
        };
    }

    public render() {
        return (
            <div
                // style={{
                //     backgroundColor: '',
                // }}
                className={`${styles.App}`}
                // className={`${styles.App} ${classNames({
                //     [styles.ShowBackground]: this.state.showBackground,
                // })}`}
            >
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
                    <>
                        <main className={styles.Drawer}>
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
                        </main>
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
                                onCreateSprintClick={this.onCreateSprintClick}
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
                                onShowSprintsViewClick={
                                    this.onShowSprintsViewClick
                                }
                                onShowInsightsViewClick={
                                    this.onShowInsightsViewClick
                                }
                                onShowPlanningViewClick={
                                    this.onShowPlanningViewClick
                                }
                                onShowKnowledgeViewClick={
                                    this.onShowKnowledgeViewClick
                                }
                                onShowHelpCenterViewClick={
                                    this.onShowHelpCenterViewClick
                                }
                            />
                            {this.state.activeTeamId ? (
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
                                                dropReceiverLayer={
                                                    this.state
                                                        .backlogDropReceiverLayer
                                                }
                                                taskFilters={
                                                    this.state.taskFilters
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
                                                onViewTaskDetail={
                                                    this.onViewTaskDetail
                                                }
                                                onCreateSprintClick={
                                                    this.onCreateSprintClick
                                                }
                                                onTaskFiltersChange={
                                                    this.onTaskFiltersChange
                                                }
                                            />
                                        </Route>
                                        <Route
                                            router={this.router}
                                            pattern={insightsRoutePattern}
                                        >
                                            <InsightsComponent
                                                deps={this.props.deps}
                                            />
                                        </Route>
                                        <Route
                                            router={this.router}
                                            pattern={planningRoutePattern}
                                        >
                                            <PlanningComponent />
                                        </Route>
                                    </div>
                                </div>
                            ) : (
                                this.renderSelectActiveTeam()
                            )}
                        </div>
                    </>
                )}
                <Route router={this.router} pattern={invitationRoutePattern}>
                    <InvitationComponent deps={this.props.deps} />
                </Route>
                <TaskDetailModalComponent
                    ref={this.taskDetailModalRef}
                    deps={this.props.deps}
                    onClose={this.onTaskDetailModalClose}
                />
                <CreateTeamModalComponent
                    ref={this.createTeamModalRef}
                    deps={this.props.deps}
                />
                <TeamSettingsModalComponent
                    deps={this.props.deps}
                    ref={this.teamSettingsModalRef}
                    onAddTeamMemberClick={this.onAddTeamMembersClick}
                />
                <TeamProfileUpdatedFeedbackComponent deps={this.props.deps} />
                <AddTeamMembersModalComponent
                    deps={this.props.deps}
                    ref={this.addTeamMembersModalRef}
                    onTeamMembersAdded={this.onTeamMembersAdded}
                />
                <UserSettingsModalComponent
                    ref={this.userModalRef}
                    deps={this.props.deps}
                />
                <CreateSprintModalComponent
                    ref={this.createSprintModalRef}
                    deps={this.props.deps}
                />
                <UserProfileUpdatedFeedbackComponent deps={this.props.deps} />
                <TaskUpdatedFeedbackComponent deps={this.props.deps} />
                <InvitationLinkCopiedFeedbackComponent deps={this.props.deps} />
                <RequiredActionsModalComponent
                    ref={this.requiredActionsModalRef}
                />
            </div>
        );
    }

    public async componentDidMount() {
        console.log(`[AppComponent]componentDidMount`);
        this.monitorStateChanges();
        this.router.initBrowserUri();
        this.monitorUserActions();
        this.dragAndDropEventChan =
            this.props.deps.dragAndDropController.subscribeDragAndDropEvent();
        (async () => {
            while (true) {
                const event = await this.dragAndDropEventChan?.pop();
                if (event === undefined) {
                    return;
                }

                if (
                    event.type === 'DragStart' &&
                    event.target.type === draggableTask
                ) {
                    await this.stateSyncer.startDraggingTask(
                        event.target.data.id,
                    );
                }

                if (
                    event.type === 'DragEnd' &&
                    event.target.type === draggableTask
                ) {
                    await this.stateSyncer.stopDraggingTask(
                        event.target.data.id,
                    );
                }

                if (
                    event.type === 'Drop' &&
                    sectionIds.includes(event.srcContainId) &&
                    sectionIds.includes(event.destContainerId) &&
                    event.target.type === draggableTask
                ) {
                    this.processTaskDrop(
                        event.srcContainId,
                        event.destContainerId,
                        event.target.data,
                        event.context,
                    );
                }
            }
        })().then();
        this.props.deps.eventDetectionScheduler.start();
        this.props.deps.keyBoardEventMonitor.start();
    }

    public componentWillUnmount() {
        console.log(`[AppComponent]componentWillUnmount`);
        this.props.deps.eventDetectionScheduler.stop();
        this.props.deps.keyBoardEventMonitor.stop();
        closeIfNot(this.stateChangeChan);
        closeIfNot(this.dragAndDropEventChan);
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

    private renderSelectActiveTeam() {
        const teams = this.state.teams;
        return (
            <div className={styles.SelectActiveTeam}>
                <div className={styles.Content}>
                    <div className={styles.Title}>Select Active Team</div>
                    <div className={styles.AddTeam}>
                        <div
                            className={styles.Button}
                            onClick={this.onCreateTeamClick}
                        >
                            <MaterialIconUI>add</MaterialIconUI>
                        </div>
                    </div>
                    {teams.length > 0 && (
                        <div className={styles.Teams}>
                            {teams.map(this.renderTeamRow)}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    private renderTeamRow = (team: Team, index: number) => {
        return (
            <div
                key={index}
                className={styles.TeamRow}
                onClick={this.onActiveTeamSelectHandler(team.id)}
            >
                {team.name}
            </div>
        );
    };

    private onActiveTeamSelectHandler = (teamId: number) => {
        return () => {
            this.router.navigateTo(sprintsPath(teamId), {
                notifyRouteChange: true,
            });
        };
    };

    private onActiveTeamSelect = async (teamId: number) => {
        await this.showActiveTeam(teamId);
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

    private showActiveTeam = async (teamId: number): Promise<void> => {
        const appState = this.localStore.getState();
        const prevActiveTeamId = appState.currTeamId;
        if (this.stateSyncer.trySetCurrentTeam(teamId)) {
            await this.stateSyncer.pullCurrentTeam();
            await this.onTeamInit();
            return;
        }

        if (prevActiveTeamId) {
            this.router.navigateTo(sprintsPath(prevActiveTeamId), {
                notifyRouteChange: true,
            });
            return;
        }

        this.router.navigateTo(rootRoutePattern);
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

    private processUserAction(userAction: UserActionEvent) {
        switch (userAction) {
            case 'findKeyword':
                this.headerRef.current?.toggleSearchInputFocus();
                break;
        }
    }

    private onBacklogToggle = () => {
        if (!this.state.showBacklog) {
            this.backlogRef.current?.refresh();
            this.setState({
                backlogDropReceiverLayer: 1,
            });
        } else {
            this.setState({
                backlogDropReceiverLayer: -1,
            });
        }

        this.setState({
            showBacklog: !this.state.showBacklog,
        });
    };

    public onViewTaskDetail = (taskId: number) => {
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

    private onCreateSprintClick = () => {
        this.createSprintModalRef.current?.open();
    };

    private onShowSprintsViewClick = () => {
        this.router.navigateTo(sprintsPath(this.state.activeTeamId!), {
            notifyRouteChange: true,
        });
    };

    private onShowInsightsViewClick = () => {
        this.router.navigateTo(insightsPath(this.state.activeTeamId!), {
            notifyRouteChange: true,
        });
    };

    private onShowPlanningViewClick = () => {
        this.router.navigateTo(planningPath(this.state.activeTeamId!), {
            notifyRouteChange: true,
        });
    };

    private onShowKnowledgeViewClick = () => {
        this.router.navigateTo(knowledgePath(this.state.activeTeamId!), {
            notifyRouteChange: true,
        });
    };

    private onShowHelpCenterViewClick = () => {
        this.router.navigateTo(helpCenterPath(this.state.activeTeamId!), {
            notifyRouteChange: true,
        });
    };

    private processTaskDrop(
        srcSectionId: string,
        destSectionId: string,
        task: Task,
        context?: DragAndDropContext,
    ) {
        switch (srcSectionId) {
            case backlogSectionId:
                this.processTask(task, context);
                break;
            case needAttentionSectionId:
            case inProgressSectionId:
                switch (destSectionId) {
                    case backlogSectionId:
                        this.stateSyncer.moveTaskToUpcoming(task.id);
                        this.removeTaskFromSprint(task.id);
                        break;
                }

                break;
            case upcomingSectionId:
            case deliveredSectionId:
                switch (destSectionId) {
                    case backlogSectionId:
                        this.removeTaskFromSprint(task.id);
                        break;
                }

                break;
        }
    }

    private processTask(task: Task, context?: DragAndDropContext) {
        const sprintId = this.localStore.getState().currSprintId;
        if (sprintId) {
            this.stateSyncer.addTaskToSprint(sprintId, task.id);
            if (context?.isPersonal) {
                this.stateSyncer.updateTask(task.id, {
                    ownerUserId: this.state.me?.id,
                    owningTeamId: task.owningTeam.id,
                    goal: task.goal,
                });
            }
        }
    }

    private removeTaskFromSprint(taskId: number) {
        const sprints = this.graphSource.task(taskId)?.sprints || [];
        for (const sprint of sprints) {
            this.stateSyncer.removeTaskFromSprint(sprint.id, taskId);
        }
    }

    private async showRequiredActionsIfAny() {
        const requiredActions: RequiredAction[] = [];
        for (let index = 0; index < this.extensions.length; index++) {
            const extension = this.extensions[index];
            const extRequiredActions = await extension.requiredActions(
                this.state.activeTeamId!,
            );
            if (extRequiredActions.length < 1) {
                continue;
            }

            const viewRef = createRef<HTMLDivElement>();
            extRequiredActions.forEach((requiredAction) => {
                const view = (
                    <div
                        key={index}
                        ref={viewRef}
                        style={{
                            height: '100%',
                        }}
                    />
                );
                requiredActions.push({
                    actionName: requiredAction.name(),
                    view,
                    renderView: () => {
                        requiredAction.renderView({
                            container: viewRef.current!,
                            onActionComplete: this.onRequireActionComplete,
                        });
                    },
                });
            });
        }

        if (requiredActions.length > 0) {
            this.requiredActionsModalRef.current?.open(requiredActions);
        }
    }

    private onRequireActionComplete = () => {
        this.requiredActionsModalRef.current?.completeCurrentStep();
    };

    public async onTeamInit() {
        try {
            this.extensions = await this.loadExtensions();
            await this.showRequiredActionsIfAny();
        } catch (err) {
            console.log(`Fail to load extensions: ${err}`);
        }
    }

    private loadExtensions(): Promise<Extension[]> {
        // TODO(magicoder10): load extension from backend
        // TODO(magicoder10): error handling when failed to load script
        return Promise.all(
            ['http://localhost:8082/app/app.js'].map(
                async (extensionEntryPoint) => {
                    let { App } = await importModule(extensionEntryPoint);
                    const app: Extension = new App();
                    const runtime = this.getExtensionRuntime(0);
                    app.init(runtime);
                    console.log(`[Extension][${app.name()}] Loaded`);
                    return app;
                },
            ),
        );
    }

    private getExtensionRuntime(extensionVersion: number): ExtensionRuntime {
        return new TeamyExtensionRuntime(
            extensionVersion,
            this.router,
            this.identityClient,
        );
    }
}

// function includePrefix(patterns: string[], input: string): boolean {
//     for (const pattern of patterns) {
//         if (input.startsWith(pattern)) {
//             return true;
//         }
//     }
//
//     return false;
// }
