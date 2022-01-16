import React, { ChangeEvent, Component, createRef } from 'react';

import { Filter, or } from '@lib/data/filter';
import { DatePickerUI } from '@lib/ui/DatePicker';
import { SpacerUI } from '@lib/ui/Spacer';
import { TextFieldUI } from '@lib/ui/TextField';

import { allTasks, between, contains, ownedBy } from '@core/data/task.filter';
import { Deps } from '@core/dep/deps';
import { Task } from '@core/entity/task';
import { User } from '@core/entity/user';
import { FormatService } from '@core/service/format.service';
import { IAppState } from '@core/state/state';

import styles from './FilterList.component.module.scss';

const all = 'all';
const unassigned = 'unassigned';
const userPrefix = 'user/';

interface Props {
    deps: Deps;
}

interface State {
    teamMembers: User[];
    selectedTaskOwners: Set<string>;
}

export class FilterListComponent extends Component<Props, State> {
    private startDataPickerRef = createRef<DatePickerUI>();
    private endDataPickerRef = createRef<DatePickerUI>();
    private keywordTextFieldRef = createRef<TextFieldUI>();

    constructor(props: Props) {
        super(props);
        const selectedTaskOwners = new Set<string>();
        selectedTaskOwners.add(all);
        this.state = {
            teamMembers: [],
            selectedTaskOwners: selectedTaskOwners,
        };
    }

    render() {
        return (
            <div className={styles.Section}>
                <div className={styles.TopBar}>
                    <div className={styles.Title}>Filters</div>
                    <SpacerUI />
                    <div className={styles.Actions}>
                        <div
                            className={styles.Action}
                            onClick={this.onSaveFiltersClick}
                        >
                            Save
                        </div>
                    </div>
                </div>
                <div className={styles.Content}>
                    {this.renderTimeRangeFilterGroup()}
                    {this.renderTaskOwnerFilterGroup()}
                    {this.renderKeywordFilterGroup()}
                </div>
            </div>
        );
    }

    public async componentDidMount() {
        const teamMembers =
            await this.props.deps.teamService.fetchTeamMembers();
        this.setState({
            teamMembers,
        });
    }

    private renderTimeRangeFilterGroup() {
        return (
            <div className={styles.Group}>
                <div className={styles.GroupName}>Time Range:</div>
                <div className={styles.GroupContent}>
                    <div className={`${styles.Input} ${styles.TextField}`}>
                        <DatePickerUI
                            ref={this.startDataPickerRef}
                            label={'Start'}
                            onChange={this.onStartDateChange}
                        />
                    </div>
                    <div className={`${styles.Input} ${styles.TextField}`}>
                        <DatePickerUI
                            ref={this.endDataPickerRef}
                            label={'End'}
                            onChange={this.onEndDateChange}
                        />
                    </div>
                </div>
            </div>
        );
    }

    private renderTaskOwnerFilterGroup() {
        return (
            <div className={styles.Group}>
                <div className={styles.GroupName}>Task Owner:</div>
                <div className={styles.GroupContent}>
                    <div className={`${styles.Input} ${styles.Option}`}>
                        <input
                            type={'checkbox'}
                            className={styles.Checkbox}
                            value={all}
                            checked={this.state.selectedTaskOwners.has(all)}
                            onChange={this.onTaskOwnersCheckBoxChange}
                        />
                        <div className={styles.Label}>All</div>
                    </div>
                    {this.state.teamMembers.map(this.renderOption)}
                    <div className={`${styles.Input} ${styles.Option}`}>
                        <input
                            type={'checkbox'}
                            className={styles.Checkbox}
                            value={unassigned}
                            checked={this.state.selectedTaskOwners.has(
                                unassigned,
                            )}
                            onChange={this.onTaskOwnersCheckBoxChange}
                        />
                        <div className={styles.Label}>Unassigned</div>
                    </div>
                </div>
            </div>
        );
    }

    private renderKeywordFilterGroup() {
        return (
            <div className={styles.Group}>
                <div className={styles.GroupName}>Contains:</div>
                <div className={styles.GroupContent}>
                    <div className={`${styles.Input} ${styles.TextField}`}>
                        <TextFieldUI
                            ref={this.keywordTextFieldRef}
                            label={'Keyword'}
                            onChange={this.onKeywordChange}
                        />
                    </div>
                </div>
            </div>
        );
    }

    private renderOption = (user: User, index: number) => (
        <div className={`${styles.Input} ${styles.Option}`} key={index}>
            <input
                type={'checkbox'}
                className={styles.Checkbox}
                value={`${userPrefix}${user.id}`}
                checked={this.state.selectedTaskOwners.has(
                    `${userPrefix}${user.id}`,
                )}
                onChange={this.onTaskOwnersCheckBoxChange}
            />
            <div className={styles.Label}>
                {FormatService.getShortName(user.firstName, user.lastName)}
            </div>
        </div>
    );

    private onTaskOwnersCheckBoxChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const value = event.currentTarget.value;
        const hasValue = this.state.selectedTaskOwners.has(value);
        if (value === all) {
            this.state.selectedTaskOwners.clear();
        } else {
            this.state.selectedTaskOwners.delete(all);
        }

        if (!hasValue) {
            this.state.selectedTaskOwners.add(value);
        } else {
            this.state.selectedTaskOwners.delete(value);
        }

        this.forceUpdate();
        this.props.deps.localStore.setState((state: IAppState) => {
            state.taskFilters.taskOwnerFilter = this.getTaskOwnerFilter();
            return state;
        });
    };

    private onStartDateChange = (date?: Date) => {
        const endDate = this.endDataPickerRef.current?.value || null;
        this.props.deps.localStore.setState((state: IAppState) => {
            state.taskFilters.timeRangeFilter = between(
                date || null,
                endDate,
                (task: Task) => task.dueAt,
            );
            return state;
        });
    };

    private onEndDateChange = (date?: Date) => {
        const startDate = this.startDataPickerRef.current?.value || null;
        this.props.deps.localStore.setState((state: IAppState) => {
            state.taskFilters.timeRangeFilter = between(
                startDate,
                date || null,
                (task: Task) => task.dueAt,
            );
            return state;
        });
    };

    private onKeywordChange = (keyword: string) => {
        this.props.deps.localStore.setState((state: IAppState) => {
            state.taskFilters.keywordFilter = contains(keyword);
            return state;
        });
    };

    private onSaveFiltersClick = () => {
        console.log('onSaveFiltersClick');
    };

    private getTaskOwnerFilter(): Filter<Task> {
        if (this.state.selectedTaskOwners.has(all)) {
            return allTasks;
        }

        const filters = Array.from(this.state.selectedTaskOwners).map(
            (key: string): Filter<Task> => {
                if (key === unassigned) {
                    return (task: Task) =>
                        !task.owner || task.owner.id === '-1';
                } else if (key.startsWith(userPrefix)) {
                    const parts = key.split('/');
                    return ownedBy(parts[1]);
                } else {
                    return allTasks;
                }
            },
        );
        return or(...filters);
    }
}
