import classNames from 'classnames';
import React, {ChangeEvent, Component, FocusEvent, createRef, MouseEvent, RefObject} from 'react';

import { Route } from '@lib/router/Route';
import { Router } from '@lib/router/router';
import { DropDownList } from '@lib/ui/DropDownList';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { SpacerUI } from '@lib/ui/Spacer';

import { userAll } from '@core/config/filter';
import { sprintsRoutePattern, teamRoutePattern } from '@core/config/routing';
import { contains } from '@core/data/task.filter';
import { Deps } from '@core/dep/deps';
import { TaskFilters, TaskFiltersData } from '@core/entity/filters';
import { Team } from '@core/entity/team';
import { User } from '@core/entity/user';

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
}

interface State {
    isSearchBarFocused: boolean;
    showBacklog: boolean;
    taskFiltersData: TaskFiltersData;
    showTeamContextMenu: boolean;
    teamContextMenuLeft: number;
    teamContextMenuTop: number;
}

export class HeaderComponent extends Component<Props, State> {
    private readonly router: Router;
    private readonly searchBarRef = createRef<HTMLDivElement>();
    private readonly searchInputRef = createRef<HTMLInputElement>();
    private teamContextMenuRef: RefObject<any> = createRef();

    constructor(props: Props) {
        super(props);
        this.router = props.deps.router;
        this.state = {
            showBacklog: false,
            isSearchBarFocused: false,
            taskFiltersData: {
                selectedTaskOwners: new Set<string>([userAll]),
            },
            showTeamContextMenu: false,
            teamContextMenuLeft: 0,
            teamContextMenuTop: 0,
        };
    }

    render() {
        return (
            <header className={styles.Header}>
                <div className={styles.LeftSection}>
                    <div className={styles.MenuButtonPlaceHolder}>
                        {!this.props.isDrawerOpen && (
                            <div
                                className={styles.MenuButton}
                                onClick={this.props.onMenuToggle}
                            >
                                <MaterialIconUI>menu</MaterialIconUI>
                            </div>
                        )}
                    </div>
                    <div className={styles.TeamName}
                         onContextMenu={this.onTeamContextMenu()}>
                        {this.props.currentTeam?.name}
                    </div>
                    <div>
                        {this.renderTeamContextMenuItem()}
                    </div>
                    <div className={styles.Tools}>
                        <DropDownList
                            selectOptionKey={'sprint'}
                            options={[
                                {
                                    key: 'sprint',
                                    description: 'Sprint',
                                },
                            ]}
                        />
                    </div>
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
                <div className={styles.RightSection}>
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

    private onTeamContextMenu = (): (event: React.MouseEvent<HTMLElement>) => void => {
        return (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();
            this.setState({
                showTeamContextMenu: true,
                teamContextMenuLeft: event.clientX,
                teamContextMenuTop: event.clientY,
            });
            setTimeout(() => {
                this.teamContextMenuRef.current?.focus();
            });

        };
    };

    private renderTeamContextMenuItem = () => {
        if (this.state.showTeamContextMenu) {
            return (
                <ul
                    ref={this.teamContextMenuRef}
                    className={styles.TeamContextMenu}
                    tabIndex={-1}
                    style={{
                        left: this.state.teamContextMenuLeft,
                        top: this.state.teamContextMenuTop,
                    }}
                    onBlur={this.onTeamContextMenuBlur}
                >
                    <li
                        className={styles.ContextMenuItem}
                        onClick={this.onAddMembersClick}
                    >
                        Add members
                    </li>
                    <li
                        className={styles.ContextMenuItem}
                        onClick={this.onShowMembersClick}
                    >
                        Show members
                    </li>
                    <li
                        className={styles.ContextMenuItem}
                        onClick={this.onShowInvitationsClick}
                    >
                        Show invitations
                    </li>
                    <li
                        className={styles.ContextMenuItem}
                        onClick={this.onViewTeamSettingsClick}
                    >
                        Settings
                    </li>
                </ul>
            )
        }
    }

    private onTeamContextMenuBlur = () => {
        this.closeTeamContextMenu();
    };

    private closeTeamContextMenu() {
        this.setState({
            showTeamContextMenu: false,
            teamContextMenuLeft: 0,
            teamContextMenuTop: 0,
        });
    }

    private onAddMembersClick = () => {
        if (this.props.currentTeam?.id) {
            this.props.onAddTeamMembersClick?.call(
                null,
                this.props.currentTeam.id,
            );
        }
        this.closeTeamContextMenu();
    };

    private onShowMembersClick = () => {
        if (this.props.currentTeam?.id) {
            this.props.onShowTeamMembersClick?.call(
                null,
                this.props.currentTeam.id,
            );
        }
        this.closeTeamContextMenu();
    };

    private onShowInvitationsClick = () => {
        if (this.props.currentTeam?.id) {
            this.props.onShowInvitationsClick?.call(
                null,
                this.props.currentTeam.id,
            );
        }
        this.closeTeamContextMenu();
    };

    private onViewTeamSettingsClick = () => {
        if (this.props.currentTeam?.id) {
            this.props.onViewTeamSettingsClick?.call(
                null,
                this.props.currentTeam.id,
            );
        }
        this.closeTeamContextMenu();
    };
}
