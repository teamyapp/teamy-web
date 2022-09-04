import React, { Component, ReactNode, createRef } from 'react';

import * as csp from '@lib/csp/csp';
import { closeIfNot } from '@lib/csp/lib';
import { and } from '@lib/data/filter';
import { DragAndDropEvent } from '@lib/dragAndDrop/DragAndDropController';
import { RouteUpdate, Router } from '@lib/router/router';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TabsUI } from '@lib/ui/Tabs';
import { TooltipUI } from '@lib/ui/Tooltip';
import { BoundingBoxFinder } from '@lib/ui/position';

import { DragAndDropContext } from '@core/config/dragAndDrop';
import { draggableTask } from '@core/config/draggable';
import {
    getSprintId,
    getTabId,
    sprintTabPath,
    sprintTabRoutePattern,
    sprintsPath,
    sprintsRoutePattern,
} from '@core/config/routing';
import {
    deliveredSectionId,
    inProgressSectionId,
    needAttentionSectionId,
    upcomingSectionId,
} from '@core/config/sections';
import { taskUrgencyOrder } from '@core/config/sortOrder';
import { orderByStartTimeDesc } from '@core/data/sprint.order';
import * as filters from '@core/data/task.filter';
import { Deps } from '@core/dep/deps';
import { TaskFilters } from '@core/entity/filters';
import { CreateTaskInput, UpdateTaskInput } from '@core/entity/input';
import { SortOrders } from '@core/entity/sortOrders';
import { Sprint } from '@core/entity/sprint';
import { Task } from '@core/entity/task';
import { User } from '@core/entity/user';
import { GraphSource } from '@core/storage/graph/graphSource';
import { LocalStore } from '@core/storage/syncer/localStore';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import { KanbanUI } from '../internal/Kanban';
import { PersonalStatusUI } from '../internal/PersonalStatus';
import { UserProfileUI } from '../internal/UserProfile';
import { getSprintName, getUserShortName } from '../internal/format';
import styles from './Sprints.component.module.scss';

const tabIds = ['me', 'team'];

const sectionIds = [
    upcomingSectionId,
    inProgressSectionId,
    deliveredSectionId,
    needAttentionSectionId,
];

interface Props {
    deps: Deps;
    taskFilters: TaskFilters;
    selectOwnerTaskId?: number;
    onShowPotentialTaskOwners?: (
        taskId: number,
        updateTaskInput: UpdateTaskInput,
        findAlignTargetBoundBox: BoundingBoxFinder,
        selectedOwnerId?: number,
    ) => void;
    onViewTaskDetail?: (taskId: number) => void;
    onCreateSprintClick?: () => void;
}

interface State {
    activeTabIndex: number;
    currentUserId: number;
    selectedSprintId?: number;
    teamMembers: User[];
    teamTasks: Task[];
    receivingSectionId?: string;
    sortOrders: SortOrders;
}

const acceptedRoutePatterns = [sprintsRoutePattern, sprintTabRoutePattern];

export class SprintsComponent extends Component<Props, State> {
    private readonly router: Router;
    private readonly localStore: LocalStore;
    private readonly graphSource: GraphSource;
    private readonly stateSyncer: StateSyncer;

    private readonly tabsRef = createRef<TabsUI>();

    private stateChangeChan?: csp.PopChannel<boolean | undefined>;
    private routeChangeChan?: csp.PopChannel<RouteUpdate | undefined>;
    private dragAndDropEventChan?: csp.PopChannel<
        DragAndDropEvent<DragAndDropContext> | undefined
    >;

    constructor(props: Props) {
        super(props);
        this.router = props.deps.router;
        this.localStore = props.deps.localStore;
        this.graphSource = props.deps.graphSource;
        this.stateSyncer = props.deps.stateSyncer;
        this.state = {
            teamMembers: [],
            activeTabIndex: 0,
            currentUserId: -1, // when not logged in yet
            teamTasks: [],
            sortOrders: {
                upcoming: taskUrgencyOrder,
            },
        };
    }

    public render(): ReactNode {
        // TODO: will change when PersonalStatus is merged with Kanban
        return this.state.selectedSprintId ? (
            <div className={styles.Sprint}>
                <div className={styles.Tabs}>
                    <div className={styles.Container}>
                        <TabsUI
                            ref={this.tabsRef}
                            defaultSelectedIndex={this.state.activeTabIndex}
                            tabNames={['Me', 'Team']}
                            onTabClick={this.onTabClick}
                        />
                    </div>
                </div>
                <div className={styles.Content}>
                    {this.renderTabContent(tabIds[this.state.activeTabIndex])}
                </div>
            </div>
        ) : (
            this.renderSelectSprint()
        );
    }

    public componentDidMount() {
        this.stateChangeChan = this.localStore.subscribeStateChange();
        (async () => {
            while (true) {
                console.log('[SprintsComponent] waiting for state changes');
                const hasChanged = await this.stateChangeChan!.pop();
                if (hasChanged === undefined) {
                    // check undefined instead of falsy because
                    // a falsy data could be valid data per channel's concern.
                    return;
                }

                if (
                    acceptedRoutePatterns.includes(
                        this.router.currentRouteUpdate.routePattern,
                    )
                ) {
                    const sprintIdParam = getSprintId(
                        this.router.currentRouteUpdate.params,
                    );
                    if (!sprintIdParam) {
                        this.onTabClick(this.state.activeTabIndex);
                    }
                }

                this.updateState();
            }
        })().then();

        for (const routePattern of acceptedRoutePatterns) {
            this.router.registerRoute(routePattern, false);
        }
        this.routeChangeChan = this.router.subscribeRouteChange();
        console.log('[SprintComponent] subscribing');
        (async () => {
            while (true) {
                const routeUpdate = await this.routeChangeChan!.pop();
                if (routeUpdate === undefined) {
                    return;
                }

                if (!acceptedRoutePatterns.includes(routeUpdate.routePattern)) {
                    continue;
                }

                console.log(
                    '[SprintComponent] accepted',
                    routeUpdate.routePattern,
                    routeUpdate.suffix,
                    routeUpdate.params.pathParams,
                );

                const appState = this.localStore.getState();
                const currTeamId = appState.currTeamId;
                if (!currTeamId) {
                    continue;
                }

                const sprintIdParam = getSprintId(routeUpdate.params);
                if (!sprintIdParam) {
                    this.onTabClick(this.state.activeTabIndex, true);
                    continue;
                }

                const tabId = getTabId(routeUpdate.params);
                if (!tabId || tabIds.indexOf(tabId) < 0) {
                    this.onTabClick(this.state.activeTabIndex, true);
                    continue;
                }

                const tabIndex = tabIds.indexOf(tabId);
                const newSprintId = parseInt(sprintIdParam);
                if (newSprintId !== appState.currSprintId) {
                    if (!this.stateSyncer.trySetCurrentSprint(newSprintId)) {
                        this.router.navigateTo(sprintsPath(currTeamId));
                    }
                }

                this.setState({
                    activeTabIndex: tabIndex,
                });
                this.tabsRef.current?.setSelectedTabIndex(
                    tabIds.indexOf(tabId),
                );
            }
        })().then();

        this.dragAndDropEventChan =
            this.props.deps.dragAndDropController.subscribeDragAndDropEvent();
        (async () => {
            while (true) {
                const event = await this.dragAndDropEventChan?.pop();
                if (event === undefined) {
                    return;
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
                    );
                }
            }
        })().then();
    }

    public componentWillUnmount() {
        closeIfNot(this.stateChangeChan);
        closeIfNot(this.routeChangeChan);
        closeIfNot(this.dragAndDropEventChan);
    }

    private renderSelectSprint(): ReactNode {
        let sprints =
            this.graphSource.team(this.localStore.getState().currTeamId!)
                ?.sprints || [];
        sprints = orderByStartTimeDesc(sprints);
        return (
            <div className={styles.SelectSprint}>
                <div className={styles.Content}>
                    <div className={styles.Title}>Select Sprint</div>
                    <div className={styles.AddSprint}>
                        <div
                            className={styles.Button}
                            onClick={this.props.onCreateSprintClick}
                        >
                            <MaterialIconUI>add</MaterialIconUI>
                        </div>
                    </div>
                    {sprints.length > 0 && (
                        <div className={styles.Sprints}>
                            {sprints.map(this.renderSprintRow)}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    private renderSprintRow = (sprint: Sprint, index: number) => {
        return (
            <div
                key={index}
                className={styles.SprintRow}
                onClick={this.onSprintRowClick(sprint.id)}
            >
                {getSprintName(sprint.startAt)}
            </div>
        );
    };

    private onSprintRowClick = (sprintId: number) => {
        return async () => {
            this.stateSyncer.trySetCurrentSprint(sprintId);
            await this.stateSyncer.pullCurrentSprint();
        };
    };

    private renderTabContent(tabId: string): ReactNode | null {
        let personalTasksFilter = filters.ownedBy(this.state.currentUserId);
        let teamTasksFilter = filters.allTasks;

        if (this.props.taskFilters.timeRangeFilter) {
            personalTasksFilter = and(
                personalTasksFilter,
                this.props.taskFilters.timeRangeFilter,
            );
            teamTasksFilter = and(
                teamTasksFilter,
                this.props.taskFilters.timeRangeFilter,
            );
        }

        if (this.props.taskFilters.taskOwnerFilter) {
            teamTasksFilter = and(
                teamTasksFilter,
                this.props.taskFilters.taskOwnerFilter,
            );
        }

        if (this.props.taskFilters.keywordFilter) {
            personalTasksFilter = and(
                personalTasksFilter,
                this.props.taskFilters.keywordFilter,
            );
            teamTasksFilter = and(
                teamTasksFilter,
                this.props.taskFilters.keywordFilter,
            );
        }

        switch (tabId) {
            case tabIds[0]:
                return (
                    <PersonalStatusUI
                        deps={this.props.deps}
                        personalTasks={this.state.teamTasks.filter(
                            personalTasksFilter,
                        )}
                        selectOwnerTaskId={this.props.selectOwnerTaskId}
                        sortOrders={this.state.sortOrders}
                        onCreateTask={this.onCreateTask}
                        onUpdateTask={this.onUpdateTask}
                        onStartTask={this.moveTaskToInProgress}
                        onDeleteTask={this.onDeleteTask}
                        onCompleteTask={this.moveTaskToDelivered}
                        onViewTaskDetail={this.props.onViewTaskDetail}
                        onReportTaskBlocked={this.onReportTaskBlocked}
                        onShowPotentialTaskOwners={
                            this.props.onShowPotentialTaskOwners
                        }
                        onSelectUpcomingOrder={this.onSelectUpcomingOrder}
                    />
                );
            case tabIds[1]:
                return (
                    <div className={styles.TeamTab}>
                        <div className={styles.ParticipantsSection}>
                            <div className={styles.Content}>
                                <div className={styles.Title}>
                                    Participants
                                    <div className={styles.Counter}>
                                        {this.state.teamMembers.length}
                                    </div>
                                </div>
                                <div className={styles.ParticipantList}>
                                    <div className={styles.Participant}>
                                        <div className={styles.AllParticipants}>
                                            <MaterialIconUI>
                                                group_work
                                            </MaterialIconUI>
                                        </div>
                                        <div className={styles.RightSection}>
                                            <div className={styles.Name}>
                                                All
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.Participant}>
                                        <div
                                            className={
                                                styles.EmptySelectionFace
                                            }
                                        >
                                            <MaterialIconUI>
                                                face
                                            </MaterialIconUI>
                                        </div>
                                        <div className={styles.RightSection}>
                                            <div className={styles.Name}>
                                                Unassigned
                                            </div>
                                        </div>
                                    </div>
                                    {this.state.teamMembers.map(
                                        this.renderParticipant,
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={styles.Kanban}>
                            <KanbanUI
                                deps={this.props.deps}
                                tasks={this.state.teamTasks.filter(
                                    teamTasksFilter,
                                )}
                                selectOwnerTaskId={this.props.selectOwnerTaskId}
                                sortOrders={this.state.sortOrders}
                                onCreateTask={this.onCreateTask}
                                onUpdateTask={this.onUpdateTask}
                                onStartTask={this.moveTaskToInProgress}
                                onDeleteTask={this.onDeleteTask}
                                onCompleteTask={this.moveTaskToDelivered}
                                onViewTaskDetail={this.props.onViewTaskDetail}
                                onReportTaskBlocked={this.onReportTaskBlocked}
                                onShowPotentialTaskOwners={
                                    this.props.onShowPotentialTaskOwners
                                }
                                onSelectUpcomingOrder={
                                    this.onSelectUpcomingOrder
                                }
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    private renderParticipant = (participant: User, index: number) => {
        return (
            <div key={index} className={styles.Participant}>
                <div className={styles.UserProfile}>
                    <UserProfileUI user={participant} />
                </div>
                <div className={styles.RightSection}>
                    <div className={styles.Name}>
                        {getUserShortName(
                            participant.firstName,
                            participant.lastName,
                        )}
                    </div>
                    <div className={styles.BandwidthSection}>
                        <div className={styles.Icon}>
                            <MaterialIconUI>electric_bolt</MaterialIconUI>
                        </div>
                        <div className={styles.Bandwidth}>
                            <TooltipUI
                                message={'Bandwidth'}
                                position={'Bottom'}
                            >
                                <div className={styles.BandwidthFull}>
                                    <div
                                        className={styles.UnusedBandwidth}
                                        style={{
                                            width: '50%',
                                        }}
                                    />
                                </div>
                            </TooltipUI>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    private updateState = () => {
        const appState = this.localStore.getState();
        const currentSprint = this.graphSource.currentSprint();
        const teamTasks = currentSprint?.tasks || [];
        if (
            this.state.selectedSprintId &&
            this.state.selectedSprintId !== appState.currSprintId
        ) {
            this.onTabClick(this.state.activeTabIndex, false);
        }

        const teamMembers = this.graphSource.currentTeam()!.members;
        if (appState.currUserId) {
            this.setState({
                teamMembers: teamMembers,
                currentUserId: appState.currUserId!,
                selectedSprintId: appState.currSprintId,
                teamTasks: teamTasks,
            });
        }
    };

    private onTabClick = (
        index: number,
        notifyRouteChange: boolean = false,
    ) => {
        const appState = this.localStore.getState();
        const currTeamId = appState.currTeamId;
        if (!currTeamId) {
            return;
        }

        const currSprintId = appState.currSprintId;
        if (!currSprintId) {
            return;
        }

        this.router.navigateTo(
            sprintTabPath(currTeamId, currSprintId, tabIds[index]),
            { notifyRouteChange: notifyRouteChange },
        );

        const tabIndex = tabIds.indexOf(tabIds[index]);
        this.setState({
            activeTabIndex: tabIndex,
        });
        this.tabsRef.current?.setSelectedTabIndex(tabIndex);
    };

    private onCreateTask = (task: CreateTaskInput): void => {
        if (task.goal.length > 0) {
            console.log('creating task');
            const appState = this.localStore.getState();
            this.stateSyncer.createTask(
                appState.currTeamId!,
                task,
                appState.currSprintId,
            );
        }
    };

    private onUpdateTask = async (taskId: number, task: UpdateTaskInput) => {
        await this.stateSyncer.updateTask(taskId, task);
        await this.props.deps.feedbackPubSub.publish({
            type: 'TaskUpdated',
            taskId: taskId,
        });
    };

    private onDeleteTask = (taskId: number): void => {
        this.stateSyncer.deleteTask(taskId);
    };

    private onReportTaskBlocked = (taskId: number): void => {
        console.log('onReportTaskBlocked', taskId);
    };

    private moveTaskToInProgress = (taskId: number): void => {
        this.stateSyncer.moveTaskToInProgress(taskId);
    };

    private moveTaskToDelivered = (taskId: number): void => {
        this.stateSyncer.moveTaskToDelivered(taskId);
    };

    private onSelectUpcomingOrder = (order: string) => {
        this.setState({
            sortOrders: Object.assign<any, SortOrders, Partial<SortOrders>>(
                {},
                this.state.sortOrders,
                {
                    upcoming: order,
                },
            ),
        });
    };

    private processTaskDrop(
        srcSectionId: string,
        destSectionId: string,
        task: Task,
    ) {
        switch (srcSectionId) {
            case upcomingSectionId:
                switch (destSectionId) {
                    case needAttentionSectionId:
                    case inProgressSectionId:
                        this.moveTaskToInProgress(task.id);
                        break;
                }

                break;
            case needAttentionSectionId:
            case inProgressSectionId:
                switch (destSectionId) {
                    case upcomingSectionId:
                        this.stateSyncer.moveTaskToUpcoming(task.id);
                        break;
                    case deliveredSectionId:
                        this.moveTaskToDelivered(task.id);
                        break;
                }

                break;
        }
    }
}
