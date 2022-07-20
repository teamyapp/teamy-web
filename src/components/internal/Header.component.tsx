import classNames from 'classnames';
import React, { ChangeEvent, Component, FocusEvent, createRef } from 'react';

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
}

interface State {
    isSearchBarFocused: boolean;
    showBacklog: boolean;
    taskFiltersData: TaskFiltersData;
}

export class HeaderComponent extends Component<Props, State> {
    private readonly router: Router;
    private readonly searchBarRef = createRef<HTMLDivElement>();
    private readonly searchInputRef = createRef<HTMLInputElement>();

    constructor(props: Props) {
        super(props);
        this.router = props.deps.router;
        this.state = {
            showBacklog: false,
            isSearchBarFocused: false,
            taskFiltersData: {
                selectedTaskOwners: new Set<string>([userAll]),
            },
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
                    <div className={styles.TeamName}>
                        {this.props.currentTeam?.name}
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
}
