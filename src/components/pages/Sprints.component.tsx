import { TooltipUI } from '@lib/ui/Tooltip';
import { ThirdPartyAppEventHub } from '@teamyapp/ext';
import classNames from 'classnames';
import React, { Component, MouseEvent, ReactNode, createRef } from 'react';

import * as csp from '@lib/csp/csp';
import { closeIfNot } from '@lib/csp/lib';
import { Filter, and, or } from '@lib/data/filter';
import { DragAndDropEvent } from '@lib/dragAndDrop/DragAndDropController';
import { InternalKeyboardEvent } from '@lib/event/keyBoardEventMoniter';
import { Router } from '@lib/router/router';
import { getPlatform } from '@lib/runtime/os';
import { Duration } from '@lib/time/duration';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TabsUI } from '@lib/ui/Tabs';

import { DragAndDropContext } from '@core/config/dragAndDrop';
import { draggableTask } from '@core/config/draggable';
import { userAll, userPrefix, userUnassigned } from '@core/config/filter';
import {
    deliveredSectionId,
    inProgressSectionId,
    needAttentionSectionId,
    upcomingSectionId,
} from '@core/config/sections';
import { taskPriorityOrder } from '@core/config/sortOrder';
import { defaultSprintTabId, sprintTabIds } from '@core/config/sprints';
import { orderByStartTimeDesc } from '@core/data/sprint.order';
import * as filters from '@core/data/task.filter';
import { allTasks, ownedBy } from '@core/data/task.filter';
import { Deps } from '@core/dep/deps';
import { TaskFilters } from '@core/entity/filters';
import { CreateTaskInput, UpdateTaskInput } from '@core/entity/input';
import { SortOrders, taskSection } from '@core/entity/sortOrders';
import { Sprint } from '@core/entity/sprint';
import { SprintParticipant } from '@core/entity/sprintParticipant';
import { Task } from '@core/entity/task';
import { sprintTabPath, sprintsPath } from '@core/routing/routes';
import { GraphSource } from '@core/storage/graph/graphSource';
import { SprintParticipantNode } from '@core/storage/graph/sprintParticipant.node';
import { LocalStore } from '@core/storage/syncer/localStore';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import { KanbanUI } from '../internal/Kanban';
import { UserProfileUI } from '../internal/UserProfile';
import { getSprintName, getUserShortName } from '../internal/format';
import styles from './Sprints.component.module.scss';
import { SelectUserPopupComponent } from 'components/internal/SelectUserPopup.component';

const TEAM_MEMBERS_POPUP_Z_INDEX = 1002;

const sectionIds = [
    upcomingSectionId,
    inProgressSectionId,
    deliveredSectionId,
    needAttentionSectionId,
];

interface Props {
    deps: Deps;
    taskFilters: TaskFilters;
    thirdPartyAppEventHubs: ThirdPartyAppEventHub[];
    onViewTaskDetail?: (taskId: number) => void;
    onCreateSprintClick?: () => void;
    onTaskFiltersChange?: (taskFilters: TaskFilters) => void;
}

interface State {
    activeTabIndex: number;
    currentUserId: number;
    selectedSprintId?: number;
    sprintTasks: Task[];
    sprintParticipants: SprintParticipant[];
    receivingSectionId?: string;
    sortOrders: SortOrders;
    selectedTaskOwners: Set<string>;
    allowMultiSelection: boolean;
    isPageReady?: boolean;
}

export class SprintsComponent extends Component<Props, State> {
    private readonly router: Router;
    private readonly localStore: LocalStore;
    private readonly graphSource: GraphSource;
    private readonly stateSyncer: StateSyncer;

    private readonly tabsRef = createRef<TabsUI>();
    private isSelectionModePermanent: boolean = false;

    private stateChangeChan?: csp.PopChannel<boolean | undefined>;
    private keyBoardEventChan?: csp.PopChannel<
        InternalKeyboardEvent | undefined
    >;
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
            activeTabIndex: 0,
            currentUserId: -1, // when not logged in yet
            sprintTasks: [],
            sprintParticipants: [],
            sortOrders: {
                upcoming: taskPriorityOrder,
                delivered: taskPriorityOrder,
            },
            selectedTaskOwners: new Set<string>([userAll]),
            allowMultiSelection: false,
            isPageReady: false,
        };
    }

    public render(): ReactNode {
        const clientId = this.localStore.getState().currClientId;
        // TODO: will change when PersonalStatus is merged with Kanban
        return (
            this.state.isPageReady &&
            (this.state.selectedSprintId ? (
                <div className={styles.Sprint}>
                    <div className={styles.Content}>
                        {this.renderTabContent(
                            sprintTabIds[this.state.activeTabIndex],
                            clientId,
                        )}
                    </div>
                </div>
            ) : (
                this.renderSelectSprint()
            ))
        );
    }

    public componentDidMount() {
        this.monitorKeyboardEvents();
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

                const appState = this.localStore.getState();
                const currentSprint = this.graphSource.currentSprint();
                const sprintTasks = currentSprint?.tasks || [];
                const sprintParticipants = currentSprint?.participants || [];
                const activeSprintTabIndex =
                    appState.activeSprintTabIndex ||
                    sprintTabIds.indexOf(defaultSprintTabId);
                if (appState.currSprintId) {
                    if (appState.sprintTabReady)
                        if (
                            appState.currSprintId !==
                                this.state.selectedSprintId ||
                            appState.activeSprintTabIndex !==
                                this.state.activeTabIndex
                        ) {
                            this.selectTab(activeSprintTabIndex, false);
                        }
                } else {
                    this.router.navigateTo(sprintsPath(appState.currTeamId!));
                }

                if (appState.currUserId) {
                    this.setState({
                        sprintParticipants:
                            sortParticipantsByName(sprintParticipants),
                        currentUserId: appState.currUserId!,
                        selectedSprintId: appState.currSprintId,
                        sprintTasks: sprintTasks,
                        isPageReady: appState.sprintTabReady,
                    });
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

                if (event.type === 'Drop') {
                    if (
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
            }
        })().then();
    }

    public componentWillUnmount() {
        closeIfNot(this.stateChangeChan);
        closeIfNot(this.dragAndDropEventChan);
    }

    private monitorKeyboardEvents() {
        this.keyBoardEventChan =
            this.props.deps.keyBoardEventMonitor.subscribe();

        (async () => {
            while (true) {
                console.log('[SprintsComponent] waiting for keyboard event');
                const keyboardEvent = await this.keyBoardEventChan!.pop();
                if (keyboardEvent === undefined) {
                    return;
                }

                const { key, eventType } = keyboardEvent;
                const platform = getPlatform();

                if (
                    (platform === 'Windows' && key === 'Control') ||
                    (platform === 'Mac' && key === 'Meta')
                ) {
                    if (['keydown', 'keyup'].includes(eventType)) {
                        if (this.isSelectionModePermanent) {
                            continue;
                        }

                        this.setState({
                            allowMultiSelection: eventType === 'keydown',
                        });
                    }
                }
            }
        })();
    }

    private renderSelectSprint(): ReactNode {
        let sprints: Sprint[] =
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

    private renderSprintRow = (sprint: Sprint) => {
        return (
            <div
                key={sprint.id}
                className={styles.SprintRow}
                onClick={this.onSprintRowClick(sprint.id)}
            >
                {getSprintName(sprint.startAt)}
            </div>
        );
    };

    private onSprintRowClick = (sprintId: number) => {
        return async () => {
            if (this.stateSyncer.trySetCurrentSprint(sprintId)) {
                await this.stateSyncer.pullCurrentSprint();
            }
        };
    };

    private onTeamMemberClick = (userId: number) => {
        if (!this.state.selectedSprintId) {
            return;
        }

        const currentTeam = this.props.deps.graphSource.currentTeam();
        if (!currentTeam) {
            return;
        }

        this.stateSyncer.addTeamMemberToSprint(
            this.state.selectedSprintId,
            currentTeam.id,
            userId,
        );
    };

    private getAvailableTeamMembers = () => {
        const currentTeam = this.props.deps.graphSource.currentTeam();
        if (!currentTeam) {
            return [];
        }

        return currentTeam.members.filter((member) => {
            return !this.state.sprintParticipants.some((participant) => {
                return participant.user.id === member.user.id;
            });
        });
    };

    private handleAddParticipantClick =
        (enabled: boolean, toggleContainer: () => void) =>
        (event: MouseEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            if (!enabled) {
                return;
            }

            toggleContainer();
        };

    private isDeleteParticipantDisabled = () => {
        return (
            this.state.selectedTaskOwners.size === 0 ||
            this.state.selectedTaskOwners.has(userAll) ||
            this.state.selectedTaskOwners.has(userUnassigned)
        );
    };

    private onDeleteSprintParticipantClick = () => {
        const currentTeam = this.props.deps.graphSource.currentTeam();
        if (!currentTeam) {
            return;
        }

        if (this.isDeleteParticipantDisabled()) {
            return;
        }

        this.state.selectedTaskOwners.forEach((userIdentity) => {
            if (!this.state.selectedSprintId) {
                return;
            }

            const userId = userIdentity.split(userPrefix)[1];
            this.stateSyncer.removeTeamMemberFromSprint(
                this.state.selectedSprintId,
                currentTeam.id,
                parseInt(userId),
            );
        });

        this.state.selectedTaskOwners.clear();
        this.state.selectedTaskOwners.add(userAll);
        this.forceUpdate();
        this.props.onTaskFiltersChange?.call(
            null,
            Object.assign<any, TaskFilters, Partial<TaskFilters>>(
                {},
                this.props.taskFilters,
                {
                    taskOwnerFilter: this.getTaskOwnerFilter(),
                },
            ),
        );
    };

    private renderTabContent(
        tabId: string,
        clientId?: number,
    ): ReactNode | null {
        let personalTasksFilter = filters.ownedBy(this.state.currentUserId);
        let teamTasksFilter = filters.allTasks;
        const teamMembers = this.getAvailableTeamMembers();
        const isDeleteParticipantDisabled = this.isDeleteParticipantDisabled();
        const users = teamMembers.map((teamMember) => teamMember.user);

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
            case sprintTabIds[0]:
                return (
                    <div className={styles.TeamTab}>
                        <div className={styles.ParticipantsSection}>
                            <div className={styles.Content}>
                                <div className={styles.Title}>
                                    Participants
                                    <div className={styles.Counter}>
                                        {this.state.sprintParticipants.length}
                                    </div>
                                </div>
                                <div className={styles.ActionsBar}>
                                    <div className={styles.Actions}>
                                        <div className={styles.Actions}>
                                            <TooltipUI
                                                message='Remove'
                                                disabled={
                                                    isDeleteParticipantDisabled
                                                }
                                                relativeLayout={
                                                    this.props.deps
                                                        .relativeLayout
                                                }
                                            >
                                                <div
                                                    className={`${styles.Action} ${styles.Delete} ${classNames(
                                                        {
                                                            [styles.Disabled]:
                                                                isDeleteParticipantDisabled,
                                                        },
                                                    )}`}
                                                    onClick={
                                                        this
                                                            .onDeleteSprintParticipantClick
                                                    }
                                                >
                                                    <MaterialIconUI>
                                                        remove
                                                    </MaterialIconUI>
                                                </div>
                                            </TooltipUI>
                                        </div>
                                        <SelectUserPopupComponent
                                            relativeLayout={
                                                this.props.deps.relativeLayout
                                            }
                                            zOffset={TEAM_MEMBERS_POPUP_Z_INDEX}
                                            users={users}
                                            onUserSelect={
                                                this.onTeamMemberClick
                                            }
                                            referenceElement={({
                                                toggleContainer,
                                                showFollower,
                                            }) => {
                                                return (
                                                    <TooltipUI
                                                        message={
                                                            'Add to sprint'
                                                        }
                                                        disabled={
                                                            !teamMembers.length ||
                                                            showFollower
                                                        }
                                                        relativeLayout={
                                                            this.props.deps
                                                                .relativeLayout
                                                        }
                                                    >
                                                        <div
                                                            className={`${styles.Action} ${styles.Add} ${classNames(
                                                                {
                                                                    [styles.Disabled]:
                                                                        teamMembers.length ===
                                                                        0,
                                                                    [styles.Active]:
                                                                        showFollower,
                                                                },
                                                            )}`}
                                                            onClick={this.handleAddParticipantClick(
                                                                teamMembers.length >
                                                                    0,
                                                                toggleContainer,
                                                            )}
                                                        >
                                                            <MaterialIconUI>
                                                                add
                                                            </MaterialIconUI>
                                                        </div>
                                                    </TooltipUI>
                                                );
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className={styles.ParticipantList}>
                                    <div className={styles.Participant}>
                                        <div
                                            onClick={this.onTaskOwnersChange(
                                                userAll,
                                            )}
                                        >
                                            <div
                                                className={`${
                                                    styles.AllParticipants
                                                }  ${classNames({
                                                    [styles.Selected]:
                                                        this.state.selectedTaskOwners.has(
                                                            userAll,
                                                        ),
                                                })}`}
                                            >
                                                <MaterialIconUI>
                                                    group_work
                                                </MaterialIconUI>
                                            </div>
                                        </div>
                                        <div className={styles.RightSection}>
                                            <div className={styles.Name}>
                                                All
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.Participant}>
                                        <div
                                            onClick={this.onTaskOwnersChange(
                                                userUnassigned,
                                            )}
                                        >
                                            <div
                                                className={`${
                                                    styles.EmptySelectionFace
                                                }  ${classNames({
                                                    [styles.Selected]:
                                                        this.state.selectedTaskOwners.has(
                                                            userUnassigned,
                                                        ),
                                                })}`}
                                            >
                                                <MaterialIconUI>
                                                    face
                                                </MaterialIconUI>
                                            </div>
                                        </div>
                                        <div className={styles.RightSection}>
                                            <div className={styles.Name}>
                                                Unassigned
                                            </div>
                                        </div>
                                    </div>
                                    {this.state.sprintParticipants.map(
                                        this.renderParticipant,
                                    )}
                                </div>
                                <div className={styles.ActionBar}>
                                    <div
                                        className={
                                            styles.MultiSelectionToggleContainer
                                        }
                                        onClick={
                                            this.onMultiSelectionToggleClick
                                        }
                                    >
                                        <input
                                            className={styles.Toggle}
                                            type='checkbox'
                                            checked={
                                                this.state.allowMultiSelection
                                            }
                                        />
                                        <div className={styles.ToggleLabel}>
                                            Select many
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.Kanban}>
                            <KanbanUI
                                deps={this.props.deps}
                                tasks={this.state.sprintTasks.filter(
                                    teamTasksFilter,
                                )}
                                currentClientId={clientId}
                                sortOrders={this.state.sortOrders}
                                thirdPartyAppEventHubs={
                                    this.props.thirdPartyAppEventHubs
                                }
                                onCreateTask={this.onCreateTask}
                                onUpdateTask={this.onUpdateTask}
                                onStartTask={this.moveTaskToInProgress}
                                onDeleteTask={this.onDeleteTask}
                                onCompleteTask={this.moveTaskToDelivered}
                                onViewTaskDetail={this.props.onViewTaskDetail}
                                onReportTaskBlocked={this.onReportTaskBlocked}
                                onSelectOrder={
                                    this.onSelectOrder
                                }
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    private onMultiSelectionToggleClick = () => {
        this.isSelectionModePermanent = !this.state.allowMultiSelection;
        this.setState({
            allowMultiSelection: !this.state.allowMultiSelection,
        });
    };

    private onTaskOwnersChange = (value: string) => {
        return () => {
            const hasValue = this.state.selectedTaskOwners.has(value);

            if (this.state.allowMultiSelection && value !== userAll) {
                if (hasValue) {
                    this.state.selectedTaskOwners.delete(value);
                } else {
                    this.state.selectedTaskOwners.delete(userAll);
                    this.state.selectedTaskOwners.add(value);
                }
            } else {
                if (hasValue && this.state.selectedTaskOwners.size === 1) {
                    this.state.selectedTaskOwners.delete(value);
                } else {
                    this.state.selectedTaskOwners.clear();
                    this.state.selectedTaskOwners.add(value);
                }
            }

            if (!this.state.selectedTaskOwners.size) {
                this.state.selectedTaskOwners.add(userAll);
            }

            this.forceUpdate();
            this.props.onTaskFiltersChange?.call(
                null,
                Object.assign<any, TaskFilters, Partial<TaskFilters>>(
                    {},
                    this.props.taskFilters,
                    {
                        taskOwnerFilter: this.getTaskOwnerFilter(),
                    },
                ),
            );
        };
    };

    private getTaskOwnerFilter(): Filter<Task> {
        if (this.state.selectedTaskOwners.has(userAll)) {
            return allTasks;
        }

        const filters = Array.from(this.state.selectedTaskOwners).map(
            (key: string): Filter<Task> => {
                if (key === userUnassigned) {
                    return (task: Task) => !task.owner;
                } else if (key.startsWith(userPrefix)) {
                    const parts = key.split('/');
                    return ownedBy(parseInt(parts[1]));
                } else {
                    return allTasks;
                }
            },
        );
        return or(...filters);
    }

    private renderParticipant = (
        participant: SprintParticipant,
        index: number,
    ) => {
        const { user } = participant;
        const unusedBandwidthPercent = safePercent(
            participant.unusedBandwidth,
            participant.totalBandwidth,
        );
        const unusedBandwidthReadable =
            participant.unusedBandwidth.toReadable();
        const totalBandwidthReadable = participant.totalBandwidth.toReadable();
        const userIdentity = `${userPrefix}${user.id}`;
        return (
            <div key={participant.user.id} className={styles.Participant}>
                <div onClick={this.onTaskOwnersChange(userIdentity)}>
                    <div
                        className={`${styles.UserProfile} ${classNames({
                            [styles.Selected]:
                                this.state.selectedTaskOwners.has(userIdentity),
                        })}`}
                    >
                        <UserProfileUI user={user} />
                    </div>
                </div>
                <div className={styles.RightSection}>
                    <div className={styles.Name}>
                        {getUserShortName(user.firstName, user.lastName)}
                    </div>
                    <div className={styles.BandwidthSection}>
                        <TooltipUI
                            relativeLayout={this.props.deps.relativeLayout}
                            message={`Bandwidth`}
                        >
                            <div className={styles.BandwidthFull}>
                                <div
                                    className={`${
                                        styles.UnusedBandwidth
                                    } ${classNames({
                                        [styles.Negative]:
                                            participant.unusedBandwidth
                                                .totalMilliSeconds < 0,
                                    })}`}
                                    style={{
                                        width: `${Math.abs(
                                            unusedBandwidthPercent,
                                        )}%`,
                                    }}
                                />
                            </div>
                        </TooltipUI>
                        <div className={styles.Label}>
                            {`${unusedBandwidthReadable} / ${totalBandwidthReadable} (${Math.floor(unusedBandwidthPercent)}%)`}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    private onTabClick = (index: number) => {
        const appState = this.localStore.getState();
        appState.activeSprintTabIndex = index;
        this.localStore.updateState(appState);
    };

    private selectTab = (index: number, notifyRouteChange: boolean) => {
        const appState = this.localStore.getState();
        const currTeamId = appState.currTeamId;
        if (!currTeamId) {
            return;
        }

        const sprintId = appState.currSprintId;
        if (!sprintId) {
            return;
        }

        this.router.navigateTo(
            sprintTabPath(currTeamId, sprintId, sprintTabIds[index]),
            {
                notifyRouteChange: notifyRouteChange,
            },
        );

        const tabIndex = sprintTabIds.indexOf(sprintTabIds[index]);
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

    private onSelectOrder = (taskSection: taskSection) => (order: string) => {
        this.setState({
            sortOrders: Object.assign<any, SortOrders, Partial<SortOrders>>(
                {},
                this.state.sortOrders,
                {
                    [taskSection]: order,
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

function safePercent(dividend: Duration, divisor: Duration): number {
    return (
        safeDivide(dividend.totalMilliSeconds, divisor.totalMilliSeconds) * 100
    );
}

function safeDivide(dividend: number, divisor: number): number {
    if (divisor === 0) {
        return 0;
    }

    return dividend / divisor;
}

function sortParticipantsByName(participants: SprintParticipantNode[]) {
    return [...participants].sort((participantA, participantB) => {
        const fullNameA = participantA.user.fullName.toUpperCase();
        const fullNameB = participantB.user.fullName.toUpperCase();
        if (fullNameA < fullNameB) {
            return 1;
        } else if (fullNameA > fullNameB) {
            return -1;
        }

        return 0;
    });
}
