import classNames from 'classnames';
import React, { ChangeEvent, Component, FocusEvent, createRef } from 'react';

import * as csp from '@lib/csp/csp';
import { closeIfNot } from '@lib/csp/lib';
import { Route } from '@lib/router/Route';
import { RouteUpdate, Router } from '@lib/router/router';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { SpacerUI } from '@lib/ui/Spacer';

import { userAll } from '@core/config/filter';
import { contains } from '@core/data/task.filter';
import { Deps } from '@core/dep/deps';
import { TaskFilters, TaskFiltersData } from '@core/entity/filters';
import { Team } from '@core/entity/team';
import { User } from '@core/entity/user';
import {
    helpCenterRoutePattern,
    insightsRoutePattern,
    knowledgeRoutePattern,
    marketplaceRoutePattern,
    planningRoutePattern,
    sprintsRoutePattern,
    teamRoutePattern,
} from '@core/routing/routes';

import { ContextMenuComponent } from './ContextMenu.component';
import { FilterListComponent } from './FilterList.component';
import styles from './Header.component.module.scss';
import { SprintsHeaderSectionComponent } from './SprintsHeaderSection.component';
import { UserProfileUI } from './UserProfile';

interface Props {
    deps: Deps;
    me: User;
    currentTeam?: Team;
    isDrawerOpen: boolean;
    taskFilters: TaskFilters;
    onMenuToggle?: () => void;
    onBacklogToggle?: () => void;
    onUserProfileClick?: () => void;
    onTaskFiltersChange?: (taskFilters: TaskFilters) => void;
    onCreateSprintClick?: () => void;
    onAddTeamMembersClick?: (teamId: number) => void;
    onShowTeamMembersClick?: (teamId: number) => void;
    onShowInvitationsClick?: (teamId: number) => void;
    onViewTeamSettingsClick?: (teamId: number) => void;
    onShowSprintsViewClick?: () => void;
    onShowInsightsViewClick?: () => void;
    onShowPlanningViewClick?: () => void;
    onShowKnowledgeViewClick?: () => void;
    onShowHelpCenterViewClick?: () => void;
    onShowMarketplaceViewClick?: () => void;
}

interface State {
    isSearchBarFocused: boolean;
    showBacklog: boolean;
    taskFiltersData: TaskFiltersData;
    showSprintsView: boolean;
    showInsightsView: boolean;
    showPlanningView: boolean;
    showKnowledgeView: boolean;
    showHelpCenterView: boolean;
    showMarketplaceView: boolean;
}

export class HeaderComponent extends Component<Props, State> {
    private readonly router: Router;
    private readonly searchBarRef = createRef<HTMLDivElement>();
    private readonly searchInputRef = createRef<HTMLInputElement>();
    private readonly teamContextMenuRef = createRef<ContextMenuComponent>();
    private routeChangeChan?: csp.PopChannel<RouteUpdate | undefined>;

    constructor(props: Props) {
        super(props);
        this.router = props.deps.router;
        this.state = {
            showBacklog: false,
            isSearchBarFocused: false,
            taskFiltersData: {
                selectedTaskOwners: new Set<string>([userAll]),
            },
            showSprintsView: false,
            showInsightsView: false,
            showPlanningView: false,
            showKnowledgeView: false,
            showHelpCenterView: false,
            showMarketplaceView: false,
        };
    }

    render() {
        return (
            <header aria-label={'header'} className={styles.Header}>
                <div
                    role={'region'}
                    aria-label={'leftSection'}
                    className={styles.LeftSection}
                >
                    <div className={styles.MenuButtonPlaceHolder}>
                        {!this.props.isDrawerOpen && (
                            <div
                                role={'button'}
                                className={styles.MenuButton}
                                onClick={this.props.onMenuToggle}
                            >
                                <MaterialIconUI>menu</MaterialIconUI>
                            </div>
                        )}
                    </div>
                    {this.props.currentTeam && (
                        <div
                            role={'button'}
                            aria-label={this.props.currentTeam.name}
                            className={styles.TeamName}
                            onClick={this.onViewTeamSettingsClick}
                            onContextMenu={this.onTeamContextMenu}
                        >
                            {this.props.currentTeam.name}
                        </div>
                    )}
                    <ContextMenuComponent
                        ref={this.teamContextMenuRef}
                        menuItems={[
                            {
                                key: 'addMembers',
                                action: this.onAddMembersClick,
                                label: 'Add Members',
                            },
                            {
                                key: 'showMembers',
                                action: this.onShowMembersClick,
                                label: 'Show Members',
                            },
                            {
                                key: 'showInvitations',
                                action: this.onShowInvitationsClick,
                                label: 'Show Invitations',
                            },
                            {
                                key: 'viewTeamSettings',
                                action: this.onViewTeamSettingsClick,
                                label: 'View Team Settings',
                            },
                        ]}
                    />
                    <Route router={this.router} pattern={teamRoutePattern}>
                        <div className={styles.BacklogSection}>
                            <div
                                className={`${styles.Button} ${classNames({
                                    [styles.Active]: this.state.showBacklog,
                                })}`}
                                onClick={this.onBacklogToggle}
                            >
                                <MaterialIconUI>work_history</MaterialIconUI>
                            </div>
                        </div>
                    </Route>
                    <Route router={this.router} pattern={sprintsRoutePattern}>
                        <div className={styles.SprintSection}>
                            <SprintsHeaderSectionComponent
                                deps={this.props.deps}
                                onCreateSprintClick={
                                    this.props.onCreateSprintClick
                                }
                            />
                        </div>
                    </Route>
                </div>
                <SpacerUI />
                <div
                    ref={this.searchBarRef}
                    className={styles.SearchBar}
                    tabIndex={-1}
                    onFocus={this.onSearchBarFocus}
                    onBlur={this.onSearchBarBlur}
                >
                    <div className={styles.Input}>
                        <input
                            ref={this.searchInputRef}
                            type={'text'}
                            className={styles.TextField}
                            placeholder={'What are you looking for?'}
                            onChange={this.onKeywordChange}
                        />
                        <div className={styles.SearchIcon}>
                            <MaterialIconUI>search</MaterialIconUI>
                        </div>
                    </div>
                    {this.state.isSearchBarFocused && (
                        <div className={styles.Filters}>
                            <FilterListComponent
                                deps={this.props.deps}
                                teamMembers={
                                    this.props.currentTeam?.members || []
                                }
                                taskFiltersData={this.state.taskFiltersData}
                                taskFilters={this.props.taskFilters}
                                onTaskFiltersChange={
                                    this.props.onTaskFiltersChange
                                }
                                onTaskFiltersDataChange={
                                    this.onTaskFiltersDataChange
                                }
                            />
                        </div>
                    )}
                </div>
                <SpacerUI />
                <div
                    role={'region'}
                    aria-label={'rightSection'}
                    className={styles.RightSection}
                >
                    <Route router={this.router} pattern={teamRoutePattern}>
                        <div className={styles.ButtonsSection}>
                            <div
                                className={`${styles.Button} ${classNames({
                                    [styles.Active]: this.state.showSprintsView,
                                })}`}
                                onClick={this.onShowSprintsViewClick}
                            >
                                <MaterialIconUI>sprint</MaterialIconUI>
                            </div>
                            <div
                                className={`${styles.Button} ${classNames({
                                    [styles.Active]:
                                        this.state.showInsightsView,
                                })}`}
                                onClick={this.onShowInsightsViewClick}
                            >
                                <MaterialIconUI>insights</MaterialIconUI>
                            </div>
                            <div
                                className={`${styles.Button} ${classNames({
                                    [styles.Active]:
                                        this.state.showPlanningView,
                                })}`}
                                onClick={this.onShowPlanningViewClick}
                            >
                                <MaterialIconUI>flag</MaterialIconUI>
                            </div>
                            <div
                                className={`${styles.Button} ${classNames({
                                    [styles.Active]:
                                        this.state.showKnowledgeView,
                                })}`}
                                onClick={this.onShowKnowledgeViewClick}
                            >
                                <MaterialIconUI>school</MaterialIconUI>
                            </div>
                            <div
                                className={`${styles.Button} ${classNames({
                                    [styles.Active]:
                                        this.state.showHelpCenterView,
                                })}`}
                                onClick={this.onShowHelpCenterViewClick}
                            >
                                <MaterialIconUI>forum</MaterialIconUI>
                            </div>
                            <div
                                className={`${styles.Button} ${classNames({
                                    [styles.Active]:
                                        this.state.showMarketplaceView,
                                })}`}
                                onClick={this.onShowMarketplaceViewClick}
                            >
                                <MaterialIconUI>shopping_cart</MaterialIconUI>
                            </div>
                        </div>
                    </Route>
                    <div className={styles.UserActionSection}></div>
                    {this.props.me && (
                        <div className={styles.UserSection}>
                            <div
                                className={styles.UserProfile}
                                onClick={this.props.onUserProfileClick}
                            >
                                <UserProfileUI user={this.props.me} />
                            </div>
                            <div className={styles.UserName}>
                                {`${this.props.me.firstName} ${this.props.me.lastName}`}
                            </div>
                        </div>
                    )}
                </div>
            </header>
        );
    }

    componentDidMount() {
        this.monitorRouteChanges();
    }

    componentWillUnmount() {
        closeIfNot(this.routeChangeChan);
    }

    public toggleSearchInputFocus = () => {
        if (!this.state.isSearchBarFocused) {
            this.searchInputRef.current?.focus();
        } else {
            this.searchInputRef.current?.blur();
            this.setState({
                isSearchBarFocused: false,
            });
        }
    };

    private monitorRouteChanges() {
        this.routeChangeChan = this.router.subscribeRouteChange();
        console.log('[HeaderComponent] subscribing route changes');
        (async () => {
            while (true) {
                const routeUpdate = await this.routeChangeChan!.pop();
                if (routeUpdate === undefined) {
                    return;
                }

                this.resetViewButtons();
                if (routeUpdate.routePattern.startsWith(sprintsRoutePattern)) {
                    this.setState({
                        showSprintsView: true,
                    });
                } else if (
                    routeUpdate.routePattern.startsWith(insightsRoutePattern)
                ) {
                    this.setState({
                        showInsightsView: true,
                    });
                } else if (
                    routeUpdate.routePattern.startsWith(planningRoutePattern)
                ) {
                    this.setState({
                        showPlanningView: true,
                    });
                } else if (
                    routeUpdate.routePattern.startsWith(knowledgeRoutePattern)
                ) {
                    this.setState({
                        showKnowledgeView: true,
                    });
                } else if (
                    routeUpdate.routePattern.startsWith(helpCenterRoutePattern)
                ) {
                    this.setState({
                        showHelpCenterView: true,
                    });
                } else if (
                    routeUpdate.routePattern.startsWith(marketplaceRoutePattern)
                ) {
                    this.setState({
                        showMarketplaceView: true,
                    });
                }
            }
        })().then();
    }

    private onSearchBarFocus = () => {
        this.setState({
            isSearchBarFocused: true,
        });
    };

    private onSearchBarBlur = (event: FocusEvent) => {
        if (!this.searchBarRef.current?.contains(event.relatedTarget)) {
            this.setState({
                isSearchBarFocused: false,
            });
        }
    };

    private onKeywordChange = (event: ChangeEvent<HTMLInputElement>) => {
        this.props.onTaskFiltersChange?.call(
            null,
            Object.assign<any, TaskFilters, Partial<TaskFilters>>(
                {},
                this.props.taskFilters,
                {
                    keywordFilter: contains(event.target.value),
                },
            ),
        );
    };

    private onTaskFiltersDataChange = (taskFiltersData: TaskFiltersData) => {
        this.setState({
            taskFiltersData,
        });
    };

    private onBacklogToggle = () => {
        this.setState({
            showBacklog: !this.state.showBacklog,
        });

        this.props.onBacklogToggle?.call(null);
    };

    private onTeamContextMenu = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        this.teamContextMenuRef.current?.open(event.clientY, event.clientX);
    };

    private onAddMembersClick = () => {
        if (this.props.currentTeam?.id) {
            this.props.onAddTeamMembersClick?.call(
                null,
                this.props.currentTeam.id,
            );
        }
    };

    private onShowMembersClick = () => {
        if (this.props.currentTeam?.id) {
            this.props.onShowTeamMembersClick?.call(
                null,
                this.props.currentTeam.id,
            );
        }
    };

    private onShowInvitationsClick = () => {
        if (this.props.currentTeam?.id) {
            this.props.onShowInvitationsClick?.call(
                null,
                this.props.currentTeam.id,
            );
        }
    };

    private onViewTeamSettingsClick = () => {
        if (this.props.currentTeam?.id) {
            this.props.onViewTeamSettingsClick?.call(
                null,
                this.props.currentTeam.id,
            );
        }
    };

    private onShowSprintsViewClick = () => {
        this.resetViewButtons();
        this.setState({
            showSprintsView: true,
        });
        this.props.onShowSprintsViewClick?.call(null);
    };

    private onShowInsightsViewClick = () => {
        this.resetViewButtons();
        this.setState({
            showInsightsView: true,
        });
        this.props.onShowInsightsViewClick?.call(null);
    };

    private onShowPlanningViewClick = () => {
        this.resetViewButtons();
        this.setState({
            showPlanningView: true,
        });
        this.props.onShowPlanningViewClick?.call(null);
    };

    private onShowKnowledgeViewClick = () => {
        this.resetViewButtons();
        this.setState({
            showKnowledgeView: true,
        });
        this.props.onShowKnowledgeViewClick?.call(null);
    };

    private onShowHelpCenterViewClick = () => {
        this.resetViewButtons();
        this.setState({
            showHelpCenterView: true,
        });
        this.props.onShowHelpCenterViewClick?.call(null);
    };

    private onShowMarketplaceViewClick = () => {
        this.resetViewButtons();
        this.setState({
            showMarketplaceView: true,
        });
        this.props.onShowMarketplaceViewClick?.call(null);
    };

    private resetViewButtons() {
        this.setState({
            showSprintsView: false,
            showInsightsView: false,
            showPlanningView: false,
            showKnowledgeView: false,
            showHelpCenterView: false,
            showMarketplaceView: false,
        });
    }
}
