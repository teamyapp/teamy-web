import React, { Component, ReactNode, createRef } from 'react';

import * as csp from '@lib/csp/csp';
import { and } from '@lib/data/filter';
import { DragAndDropEvent } from '@lib/dragAndDrop/DragAndDropController';
import { RouteUpdate, Router } from '@lib/router/router';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TabsUI } from '@lib/ui/Tabs';
import { BoundingBoxFinder } from '@lib/ui/position';

import { draggableTask } from '@core/config/draggable';
import {
    getSprintId,
    getTabId,
    getTaskId,
    getTeamId,
    sprintTabPath,
    sprintTabRoutePattern,
    sprintTaskPath,
    sprintTaskRoutePattern,
    sprintsPath,
} from '@core/config/routing';
import {
    deliveredSectionId,
    inProgressSectionId,
    needAttentionSectionId,
    upcomingSectionId,
} from '@core/config/sections';
import { taskUrgencyOrder } from '@core/config/sortOrder';
import * as filters from '@core/data/task.filter';
import { Deps } from '@core/dep/deps';
import { TaskFilters } from '@core/entity/filters';
import { CreateTaskInput, UpdateTaskInput } from '@core/entity/input';
import { SortOrders } from '@core/entity/sortOrders';
import { Task } from '@core/entity/task';
import { User } from '@core/entity/user';
import { GraphSource } from '@core/storage/graph/graphSource';
import { LocalStore } from '@core/storage/syncer/localStore';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import { KanbanUI } from '../internal/Kanban';
import { TaskDetailModalComponent } from '../internal/Modals/TaskDetailModal.component';
import { PersonalStatusUI } from '../internal/PersonalStatus';
import { SelectUserListUI } from '../internal/SelectUserList';
import styles from './Sprints.component.module.scss';

const taskOwnersListVerticalOffset = 4;
const taskOwnersListHorizontalOffset = 10;

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
}

interface State {
    activeTabIndex: number;
    showPotentialTaskOwnersList: boolean;
    findTaskOwnersAlignTargetBoundBox?: BoundingBoxFinder;
    taskOwnersListVisible: boolean;
    taskOwnersListLeft: number;
    taskOwnersListTop: number;
    currentUserId: number;
    selectedSprintId?: number;
    teamTasks: Task[];
    selectOwnerTaskId?: number;
    selectedOwnerId?: number;
    selectOwnerUpdateTaskInput?: UpdateTaskInput;
    potentialTaskOwners: User[];
    receivingSectionId?: string;
    sortOrders: SortOrders;
}

const acceptedRoutePatterns = [sprintTabRoutePattern, sprintTaskRoutePattern];

export class SprintsComponent extends Component<Props, State> {
    private readonly router: Router;
    private readonly localStore: LocalStore;
    private readonly graphSource: GraphSource;
    private readonly stateSyncer: StateSyncer;

    private readonly tabsRef = createRef<TabsUI>();
    private readonly taskDetailModalRef = createRef<TaskDetailModalComponent>();
    private readonly taskOwnersPopupRef = createRef<HTMLDivElement>();

    private stateChangeChan?: csp.PopChannel<boolean | undefined>;
    private routeChangeChan?: csp.PopChannel<RouteUpdate | undefined>;
    private dragAndDropEventChan?: csp.PopChannel<DragAndDropEvent | undefined>;

    constructor(props: Props) {
        super(props);
        this.router = props.deps.router;
        this.localStore = props.deps.localStore;
        this.graphSource = props.deps.graphSource;
        this.stateSyncer = props.deps.stateSyncer;
        this.state = {
            activeTabIndex: 0,
            showPotentialTaskOwnersList: false,
            taskOwnersListVisible: false,
            taskOwnersListLeft: 0,
            taskOwnersListTop: 0,
            currentUserId: -1, // when not logged in yet
            teamTasks: [],
            potentialTaskOwners: [],
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
                <TaskDetailModalComponent
                    ref={this.taskDetailModalRef}
                    deps={this.props.deps}
                    selectOwnerTaskId={this.state.selectOwnerTaskId}
                    onClose={this.onTaskDetailModalClose}
                    onShowPotentialTaskOwners={this.onShowPotentialTaskOwners}
                />
                {this.state.showPotentialTaskOwnersList && (
                    <div
                        ref={this.taskOwnersPopupRef}
                        className={styles.SelectTaskOwnerList}
                        style={{
                            left: this.state.taskOwnersListLeft,
                            top: this.state.taskOwnersListTop,
                            visibility: this.state.taskOwnersListVisible
                                ? 'visible'
                                : 'hidden',
                        }}
                        tabIndex={-1}
                        onBlur={this.onCloseTaskOwnersListClick}
                    >
                        <div className={styles.SelectTaskOwnerListHeader}>
                            <div
                                className={styles.CloseButton}
                                onClick={this.onCloseTaskOwnersListClick}
                            >
                                <MaterialIconUI>close</MaterialIconUI>
                            </div>
                        </div>
                        <SelectUserListUI
                            emptySelectionUserName={'Unassigned'}
                            selectedUserId={this.state.selectedOwnerId}
                            users={this.state.potentialTaskOwners}
                            onSelectUser={this.onSelectTaskOwner}
                            onRemoveSelection={this.onRemoveTaskOwner}
                        />
                    </div>
                )}
            </div>
        ) : (
            this.renderCreateSprint()
        );
    }

    public componentDidMount() {
        window.addEventListener('resize', this.onWindowResize);
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

                const teamIDParam = getTeamId(
                    this.router.currentRouteUpdate.params,
                );
                if (!teamIDParam) {
                    continue;
                }

                const team = this.graphSource.currentTeam();
                if (!team) {
                    continue;
                }

                if (team.id !== parseInt(teamIDParam)) {
                    continue;
                }

                const sprintId = this.graphSource.currentSprint()?.id;
                if (sprintId) {
                    const tabId = getTabId(
                        this.router.currentRouteUpdate.params,
                    );
                    if (!tabId || tabIds.indexOf(tabId) < 0) {
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

                const currTeam = this.graphSource.currentTeam();
                if (!currTeam) {
                    continue;
                }

                const currSprint = this.graphSource.currentSprint();
                if (!currSprint) {
                    this.router.navigateTo(sprintsPath(currTeam.id));
                    continue;
                }

                const sprintIdParam = getSprintId(routeUpdate.params);
                if (!sprintIdParam) {
                    this.onTabClick(this.state.activeTabIndex);
                    continue;
                }

                const newSprintId = parseInt(sprintIdParam);
                if (newSprintId !== currSprint?.id) {
                    if (!this.stateSyncer.trySetCurrentSprint(newSprintId)) {
                        this.onTabClick(this.state.activeTabIndex);
                    }
                    continue;
                }

                const tabId = getTabId(routeUpdate.params);
                const taskIdParam = getTaskId(routeUpdate.params);
                if (!tabId || tabIds.indexOf(tabId) < 0) {
                    continue;
                }

                console.log(
                    '[SprintComponent] accepted',
                    routeUpdate.routePattern,
                    routeUpdate.suffix,
                    routeUpdate.params.pathParams,
                );
                this.setState({
                    activeTabIndex: tabIds.indexOf(tabId),
                });
                this.tabsRef.current?.setSelectedTabIndex(
                    tabIds.indexOf(tabId),
                );

                if (taskIdParam) {
                    const taskId = parseInt(taskIdParam);
                    this.taskDetailModalRef.current?.open(taskId);
                }
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
        window.removeEventListener('resize', this.onWindowResize);

        this.stateChangeChan?.close();
        this.routeChangeChan?.close();
        this.dragAndDropEventChan?.close();
    }

    private renderCreateSprint(): ReactNode {
        // TODD: Allow user to create a sprint
        return <div>No Sprint</div>;
    }

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
                        selectOwnerTaskId={this.state.selectOwnerTaskId}
                        sortOrders={this.state.sortOrders}
                        onCreateTask={this.onCreateTask}
                        onUpdateTask={this.onUpdateTask}
                        onStartTask={this.moveTaskToInProgress}
                        onDeleteTask={this.onDeleteTask}
                        onCompleteTask={this.moveTaskToDelivered}
                        onViewTaskDetail={this.onViewTaskDetail}
                        onReportTaskBlocked={this.onReportTaskBlocked}
                        onShowPotentialTaskOwners={
                            this.onShowPotentialTaskOwners
                        }
                        onSelectUpcomingOrder={this.onSelectUpcomingOrder}
                    />
                );
            case tabIds[1]:
                return (
                    <KanbanUI
                        deps={this.props.deps}
                        tasks={this.state.teamTasks.filter(teamTasksFilter)}
                        selectOwnerTaskId={this.state.selectOwnerTaskId}
                        sortOrders={this.state.sortOrders}
                        onCreateTask={this.onCreateTask}
                        onUpdateTask={this.onUpdateTask}
                        onStartTask={this.moveTaskToInProgress}
                        onDeleteTask={this.onDeleteTask}
                        onCompleteTask={this.moveTaskToDelivered}
                        onViewTaskDetail={this.onViewTaskDetail}
                        onReportTaskBlocked={this.onReportTaskBlocked}
                        onShowPotentialTaskOwners={
                            this.onShowPotentialTaskOwners
                        }
                        onSelectUpcomingOrder={this.onSelectUpcomingOrder}
                    />
                );
            default:
                return null;
        }
    }

    private showTaskDetail(taskId: number) {
        const team = this.graphSource.currentTeam();
        if (!team) {
            return;
        }

        this.router.navigateTo(
            sprintTaskPath(
                team.id,
                this.state.selectedSprintId!,
                tabIds[this.state.activeTabIndex!],
                `${taskId}`,
            ),
        );
    }

    private onTaskDetailModalClose = () => {
        this.onTabClick(this.state.activeTabIndex);
    };

    private updateState = () => {
        const currentUser = this.graphSource.currentUser();
        const currentSprint = this.graphSource.currentSprint();
        console.log('222222', currentSprint?.id);
        const teamTasks = currentSprint?.tasks || [];
        if (currentUser) {
            this.setState({
                currentUserId: currentUser.id,
                selectedSprintId: currentSprint?.id,
                teamTasks: teamTasks,
            });
        }
    };

    private onTabClick = (
        index: number,
        notifyRouteChange: boolean = false,
    ) => {
        const currTeam = this.graphSource.currentTeam();
        if (!currTeam) {
            return;
        }

        const sprint = this.graphSource.currentSprint();
        if (!sprint) {
            return;
        }

        this.router.navigateTo(
            sprintTabPath(currTeam.id, sprint.id, tabIds[index]),
            { notifyRouteChange: notifyRouteChange },
        );

        const tabIndex = tabIds.indexOf(tabIds[index]);
        this.setState({
            activeTabIndex: tabIndex,
        });
        this.tabsRef.current?.setSelectedTabIndex(tabIndex);
    };

    private onShowPotentialTaskOwners = async (
        taskId: number,
        updateTaskInput: UpdateTaskInput,
        findAlignTargetBoundBox: BoundingBoxFinder,
        selectedOwnerId?: number,
    ) => {
        await this.stateSyncer.pullCurrentTeamMembers();
        const owners = this.graphSource.currentTeam()!.members;
        this.setState({
            potentialTaskOwners: owners,
            selectOwnerTaskId: taskId,
            selectedOwnerId,
            selectOwnerUpdateTaskInput: updateTaskInput,
            findTaskOwnersAlignTargetBoundBox: findAlignTargetBoundBox,
            showPotentialTaskOwnersList: true,
        });

        setTimeout(() => {
            this.setState({
                taskOwnersListVisible: true,
            });

            this.taskOwnersPopupRef.current?.focus();
            this.updateTaskOwnersListPosition();
        });
    };

    private onRemoveTaskOwner = () => {
        this.stateSyncer.updateTask(
            this.state.selectOwnerTaskId!,
            Object.assign<any, UpdateTaskInput, Partial<UpdateTaskInput>>(
                {},
                this.state.selectOwnerUpdateTaskInput!,
                {
                    ownerUserId: undefined,
                },
            ),
        );
        this.setState({
            potentialTaskOwners: [],
            showPotentialTaskOwnersList: false,
            taskOwnersListVisible: false,
            selectedOwnerId: undefined,
            selectOwnerTaskId: undefined,
        });
    };

    private onSelectTaskOwner = (userId: number) => {
        this.stateSyncer.updateTask(
            this.state.selectOwnerTaskId!,
            Object.assign<any, UpdateTaskInput, Partial<UpdateTaskInput>>(
                {},
                this.state.selectOwnerUpdateTaskInput!,
                {
                    ownerUserId: userId,
                },
            ),
        );
        this.setState({
            potentialTaskOwners: [],
            showPotentialTaskOwnersList: false,
            taskOwnersListVisible: false,
            selectedOwnerId: undefined,
            selectOwnerTaskId: undefined,
        });
    };

    private updateTaskOwnersListPosition = () => {
        if (!this.state.showPotentialTaskOwnersList) {
            return;
        }

        if (!this.state.findTaskOwnersAlignTargetBoundBox) {
            return;
        }

        const boundingBox = this.state.findTaskOwnersAlignTargetBoundBox();
        const width = this.taskOwnersPopupRef.current?.offsetWidth || 0;
        const height = this.taskOwnersPopupRef.current?.offsetHeight || 0;
        const left = Math.min(
            boundingBox.left,
            document.body.clientWidth - width - taskOwnersListHorizontalOffset,
        );
        let top =
            boundingBox.top + boundingBox.height + taskOwnersListVerticalOffset;
        if (top + height > document.body.clientHeight) {
            top = boundingBox.top - height - taskOwnersListVerticalOffset;
        }

        this.setState({
            taskOwnersListLeft: left,
            taskOwnersListTop: top,
        });
    };

    private onWindowResize = () => {
        this.updateTaskOwnersListPosition();
    };

    private onViewTaskDetail = async (taskId: number): Promise<void> => {
        this.showTaskDetail(taskId);
    };

    private onCreateTask = (task: CreateTaskInput): void => {
        if (task.goal.length > 0) {
            console.log('creating task');
            this.stateSyncer.createTask(
                this.graphSource.currentTeam()!.id,
                task,
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

    private onCloseTaskOwnersListClick = () => {
        this.setState({
            potentialTaskOwners: [],
            selectOwnerTaskId: undefined,
            taskOwnersListVisible: false,
            showPotentialTaskOwnersList: false,
        });
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
                    case deliveredSectionId:
                        this.moveTaskToDelivered(task.id);
                        break;
                }
                break;
        }
    }
}
