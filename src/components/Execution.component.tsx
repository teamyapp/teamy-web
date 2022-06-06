import React, { Component, ReactNode, createRef } from 'react';

import * as csp from '@lib/csp/csp';
import { and } from '@lib/data/filter';
import { DragAndDropEvent } from '@lib/dragAndDrop/DragAndDropController';
import { Route } from '@lib/router/Route';
import { RouteUpdate, Router } from '@lib/router/router';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TabsUI } from '@lib/ui/Tabs';
import { BoundingBoxFinder } from '@lib/ui/position';

import { draggableTask } from '@core/config/draggable';
import {
    executionTabPath,
    executionTabRoutePattern,
    executionTaskPath,
    executionTaskRoutePattern,
    getTabId,
    getTaskId,
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
import { GraphSource } from '@core/graph/graphSource';

import styles from './Execution.component.module.scss';
import { KanbanUI } from './shared/Kanban';
import { TaskDetailModalComponent } from './shared/Modals/TaskDetailModal.component';
import { PersonalStatusUI } from './shared/PersonalStatus';
import { SelectUserListUI } from './shared/SelectUserList';

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
    teamId: number;
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
    needAttentionTask?: Task;
    teamTasks: Task[];
    selectOwnerTaskId?: number;
    selectedOwnerId?: number;
    selectOwnerUpdateTaskInput?: UpdateTaskInput;
    potentialTaskOwners: User[];
    receivingSectionId?: string;
    sortOrders: SortOrders;
}

const acceptedRoutePatterns = [
    executionTabRoutePattern,
    executionTaskRoutePattern,
];

export class ExecutionComponent extends Component<Props, State> {
    private readonly router: Router;
    private readonly graphSource: GraphSource;

    private readonly taskDetailModalRef = createRef<TaskDetailModalComponent>();
    private readonly taskOwnersPopupRef = createRef<HTMLDivElement>();

    private stateChangeChan?: csp.PopChannel<boolean | undefined>;
    private routeChangeChan?: csp.PopChannel<RouteUpdate | undefined>;
    private dragAndDropEventChan?: csp.PopChannel<DragAndDropEvent | undefined>;

    constructor(props: Props) {
        super(props);
        this.router = props.deps.router;
        this.graphSource = props.deps.graphSource;
        this.state = {
            activeTabIndex: -1,
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
        return (
            <div className={styles.Execution}>
                <div className={styles.Tabs}>
                    <div className={styles.Container}>
                        {this.state.activeTabIndex >= 0 && (
                            <TabsUI
                                defaultSelectedIndex={this.state.activeTabIndex}
                                tabNames={['Me', 'Team']}
                                onTabClick={this.onTabClick}
                            />
                        )}
                    </div>
                </div>
                <div className={styles.Content}>
                    {this.state.activeTabIndex >= 0 && (
                        <Route
                            router={this.router}
                            pattern={executionTabRoutePattern}
                        >
                            {this.renderTabContent(
                                tabIds[this.state.activeTabIndex],
                            )}
                        </Route>
                    )}
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
        );
    }

    public componentDidMount() {
        window.addEventListener('resize', this.onWindowResize);
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

        for (const routePattern of acceptedRoutePatterns) {
            this.router.registerRoute(routePattern, false);
        }
        this.router.navigateToCurrUri();
        this.routeChangeChan = this.router.subscribeRouteChange();
        console.log('[ExecutionComponent]subscribing');
        (async () => {
            while (true) {
                const routeUpdate = await this.routeChangeChan!.pop();
                if (routeUpdate === undefined) {
                    return;
                }

                if (
                    !acceptedRoutePatterns.includes(routeUpdate.routePattern) ||
                    routeUpdate.suffix
                ) {
                    console.log(
                        '[ExecutionComponent][Discarded]',
                        routeUpdate.routePattern,
                        routeUpdate.suffix,
                        routeUpdate.params.pathParams,
                    );
                    this.onTabClick(0);
                    continue;
                }

                console.log(
                    '[ExecutionComponent][Accepted]',
                    routeUpdate.routePattern,
                    routeUpdate.suffix,
                    routeUpdate.params.pathParams,
                );

                const tabId = getTabId(routeUpdate.params);
                const taskIdParam = getTaskId(routeUpdate.params);
                if (!tabId || tabIds.indexOf(tabId) < 0) {
                    this.onTabClick(0);
                    continue;
                }

                this.setState({
                    activeTabIndex: tabIds.indexOf(tabId),
                });

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

    public componentDidUpdate(
        prevProps: Readonly<Props>,
        prevState: Readonly<State>,
        snapshot?: any,
    ) {
        if (prevProps.teamId !== this.props.teamId) {
            if (this.state.activeTabIndex >= 0) {
                this.onTabClick(this.state.activeTabIndex);
            }
        }
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.onWindowResize);

        this.stateChangeChan?.close();
        this.routeChangeChan?.close();
        this.dragAndDropEventChan?.close();
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

        let needAttention = this.state.needAttentionTask;
        if (needAttention) {
            if (!personalTasksFilter(needAttention)) {
                needAttention = undefined;
            }
        }

        switch (tabId) {
            case tabIds[0]:
                return (
                    <PersonalStatusUI
                        deps={this.props.deps}
                        needAttentionTask={needAttention}
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
        this.router.navigateTo(
            executionTaskPath(
                this.props.teamId,
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
        const currentTeam = this.graphSource.currentTeam();
        const teamTasks = currentTeam?.tasks || [];
        const needAttention = teamTasks.filter(
            (task) => task.status === 'IN_PROGRESS',
        )[0];
        if (currentUser) {
            this.setState({
                currentUserId: currentUser.id,
                needAttentionTask: needAttention,
                teamTasks: teamTasks,
            });
        }
    };

    private onTabClick = (index: number) => {
        this.router.navigateTo(
            executionTabPath(this.props.teamId, tabIds[index]),
        );
    };

    private onShowPotentialTaskOwners = async (
        taskId: number,
        updateTaskInput: UpdateTaskInput,
        findAlignTargetBoundBox: BoundingBoxFinder,
        selectedOwnerId?: number,
    ) => {
        await this.graphSource.syncCurrentTeamMembers();
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
        this.graphSource.updateTask(
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
        this.graphSource.updateTask(
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
            this.graphSource.createTask(
                this.graphSource.currentTeam()!.id,
                task,
            );
        }
    };

    private onUpdateTask = async (taskId: number, task: UpdateTaskInput) => {
        await this.graphSource.updateTask(taskId, task);
        await this.props.deps.feedbackPubSub.publish({
            type: 'TaskUpdated',
            taskId: taskId,
        });
    };

    private onDeleteTask = (taskId: number): void => {
        this.graphSource.deleteTask(taskId);
    };

    private onReportTaskBlocked = (taskId: number): void => {
        console.log('onReportTaskBlocked', taskId);
    };

    private moveTaskToInProgress = (taskId: number): void => {
        this.graphSource.moveTaskToInProgress(taskId);
    };

    private moveTaskToDelivered = (taskId: number): void => {
        this.graphSource.moveTaskToDelivered(taskId);
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
