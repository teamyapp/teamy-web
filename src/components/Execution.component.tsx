import React, { Component, ReactElement, createRef } from 'react';

import * as csp from '@lib/csp/csp';
import { and } from '@lib/data/filter';
import { DragAndDropEvent } from '@lib/dragAndDrop/DragAndDropController';
import { Route } from '@lib/router/Route';
import { RouteUpdate, Router } from '@lib/router/router';
import { LocalStore } from '@lib/store/localStore';
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
import { SortOrders } from '@core/entity/sortOrders';
import { Task } from '@core/entity/task';
import { TaskAction } from '@core/entity/taskAction';
import { User } from '@core/entity/user';
import { MutationEvent } from '@core/event/mutation';
import { IAppState } from '@core/state/state';

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
    teamId: string;
    taskFilters: TaskFilters;
}

interface State {
    activeTabIndex: number;
    showPotentialTaskOwnersList: boolean;
    findTaskOwnersAlignTargetBoundBox?: BoundingBoxFinder;
    taskOwnersListVisible: boolean;
    taskOwnersListLeft: number;
    taskOwnersListTop: number;
    currentUserId: string;
    needAttentionTask?: Task;
    teamTasks: Task[];
    taskSelectingOwner?: Task;
    potentialTaskOwners: User[];
    taskAdding?: Task;
    receivingSectionId?: string;
    sortOrders: SortOrders;
}

const acceptedRoutePatterns = [
    executionTabRoutePattern,
    executionTaskRoutePattern,
];

export class ExecutionComponent extends Component<Props, State> {
    private readonly localStore: LocalStore<IAppState, MutationEvent>;
    private readonly router: Router;
    private readonly taskDetailModalRef = createRef<TaskDetailModalComponent>();
    private readonly taskOwnersPopupRef = createRef<HTMLDivElement>();

    private stateChangeChan?: csp.PopChannel<IAppState | undefined>;
    private routeChangeChan?: csp.PopChannel<RouteUpdate | undefined>;
    private dragAndDropEventChan?: csp.PopChannel<DragAndDropEvent | undefined>;

    constructor(props: Props) {
        super(props);
        this.localStore = props.deps.localStore;
        this.router = props.deps.router;
        this.state = {
            activeTabIndex: -1,
            showPotentialTaskOwnersList: false,
            taskOwnersListVisible: false,
            taskOwnersListLeft: 0,
            taskOwnersListTop: 0,
            currentUserId: '-1', // when not logged in yet
            teamTasks: [],
            potentialTaskOwners: [],
            sortOrders: {
                upcoming: taskUrgencyOrder,
            },
        };
    }

    public render(): ReactElement {
        // TODO: will change when PersonalStatus is merged with Kanban
        return (
            <div className={styles.Execution} onScrollCapture={this.onScroll}>
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
                    taskSelectingOwner={this.state.taskSelectingOwner?.id}
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
                            selectedUserId={
                                this.state.taskSelectingOwner?.owner?.id
                            }
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
                const taskId = getTaskId(routeUpdate.params);
                if (!tabId || tabIds.indexOf(tabId) < 0) {
                    this.onTabClick(0);
                    continue;
                }

                this.setState({
                    activeTabIndex: tabIds.indexOf(tabId),
                });

                if (taskId) {
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

    private renderTabContent(tabId: string): ReactElement | null {
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
                        taskAdding={this.state.taskAdding}
                        taskSelectingOwner={this.state.taskSelectingOwner}
                        sortOrders={this.state.sortOrders}
                        onAddClick={this.onPersonalAddClick}
                        onViewTaskDetailClick={this.onViewTaskDetailClick}
                        onNewTaskChange={this.onNewTaskChange}
                        onCreateTask={this.onCreateTask}
                        onUpdateTask={this.onUpdateTask}
                        onDeleteTaskClick={this.onDeleteTaskClick}
                        onStartTaskClick={this.onStartTaskClick}
                        onCompleteTaskClick={this.onCompleteTaskClick}
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
                        taskAdding={this.state.taskAdding}
                        taskSelectingOwner={this.state.taskSelectingOwner}
                        sortOrders={this.state.sortOrders}
                        onAddClick={this.onTeamAddClick}
                        onViewTaskDetailClick={this.onViewTaskDetailClick}
                        onNewTaskChange={this.onNewTaskChange}
                        onCreateTask={this.onCreateTask}
                        onUpdateTask={this.onUpdateTask}
                        onDeleteTaskClick={this.onDeleteTaskClick}
                        onStartTaskClick={this.onStartTaskClick}
                        onCompleteTaskClick={this.onCompleteTaskClick}
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

    private showTaskDetail(taskId: number | string) {
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

    private updateState = (state: IAppState) => {
        if (state.currentUser) {
            this.setState({
                currentUserId: state.currentUser.id,
                needAttentionTask: state.needAttentionTask,
                teamTasks: state.teamTasks,
            });
        }
    };

    private onTabClick = (index: number) => {
        this.router.navigateTo(
            executionTabPath(this.props.teamId, tabIds[index]),
        );
    };

    private onShowPotentialTaskOwners = async (
        task: Task,
        findAlignTargetBoundBox: BoundingBoxFinder,
    ) => {
        const owners = await this.props.deps.teamService.fetchTeamMembers();
        this.setState({
            potentialTaskOwners: owners,
            taskSelectingOwner: task,
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
        this.localStore.mutate({
            type: 'RemoveTaskOwner',
            taskId: this.state.taskSelectingOwner?.id || '-1',
        });
        this.setState({
            potentialTaskOwners: [],
            showPotentialTaskOwnersList: false,
            taskOwnersListVisible: false,
            taskSelectingOwner: undefined,
        });
    };

    private onSelectTaskOwner = (userId: string) => {
        this.localStore.mutate({
            type: 'UpdateTask',
            task: Object.assign({}, this.state.taskSelectingOwner, {
                owner: Object.assign({}, this.state.taskSelectingOwner?.owner, {
                    id: userId,
                }),
            }),
        });
        this.setState({
            potentialTaskOwners: [],
            showPotentialTaskOwnersList: false,
            taskOwnersListVisible: false,
            taskSelectingOwner: undefined,
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

    private onScroll = () => {
        if (!this.state.showPotentialTaskOwnersList) {
            return;
        }

        this.taskOwnersPopupRef.current?.blur();
    };

    private onViewTaskDetailClick = async (
        taskId: number | string,
    ): Promise<void> => {
        this.showTaskDetail(taskId);
    };

    private onNewTaskChange = (task: Task) => {
        this.setState({
            taskAdding: task,
        });
    };

    private onCreateTask = (task: Task): void => {
        if (task.goal.length > 0) {
            console.log('creating task');
            this.localStore.mutate({
                type: 'CreateTask',
                task: {
                    goal: task.goal,
                    context: task.context,
                    dueAt: task.dueAt,
                    ownerUserId: task.owner?.id || undefined,
                },
                teamId: this.props.teamId,
            });
        }

        // remove the adding task UI
        this.setState({
            taskAdding: undefined,
        });
    };

    private onUpdateTask = async (task: Task) => {
        await this.localStore.mutate({
            type: 'UpdateTask',
            task: task,
        });

        await this.props.deps.feedbackPubSub.publish({
            type: 'TaskUpdated',
            task: task,
        });
    };

    private onDeleteTaskClick = (taskId: string): void => {
        // don't care if the consumer is ready to pop, no await
        this.localStore.mutate({
            type: 'DeleteTask',
            taskId: taskId,
        });
    };

    private onStartTaskClick = (taskId: string): void => {
        // don't care if the consumer is ready to pop, no await
        this.localStore.mutate({
            type: 'StartTask',
            taskId: taskId,
        });
    };

    private onCompleteTaskClick = (taskId: string): void => {
        // don't care if the consumer is ready to pop, no await
        this.localStore.mutate({
            type: 'CompleteTask',
            taskId: taskId,
        });
    };

    private onPersonalAddClick = async (): Promise<void> => {
        const user = await this.props.deps.userService.fetchMe('cache-first');
        this.setState({
            taskAdding: {
                id: '-1',
                goal: '',
                owner: user,
                availableActions: [TaskAction.AssignOwner, TaskAction.Delete],
                status: 'UPCOMING',
            },
        });
    };

    private onTeamAddClick = () => {
        this.setState({
            taskAdding: {
                id: '-1',
                goal: '',
                availableActions: [TaskAction.AssignOwner, TaskAction.Delete],
                status: 'UPCOMING',
            },
        });
    };

    private onCloseTaskOwnersListClick = () => {
        this.setState({
            potentialTaskOwners: [],
            taskSelectingOwner: undefined,
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
                        this.onStartTaskClick(task.id);
                        break;
                }
                break;
            case needAttentionSectionId:
            case inProgressSectionId:
                switch (destSectionId) {
                    case deliveredSectionId:
                        this.onCompleteTaskClick(task.id);
                        break;
                }
                break;
        }
    }
}
