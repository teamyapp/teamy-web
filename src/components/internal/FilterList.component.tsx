import React, { ChangeEvent, Component, createRef } from 'react';

import { Filter, or } from '@lib/data/filter';
import { DateTextPickerUI } from '@lib/ui/DateTextPicker';
import { SpacerUI } from '@lib/ui/Spacer';

import { userAll, userPrefix, userUnassigned } from '@core/config/filter';
import { allTasks, between, ownedBy } from '@core/data/task.filter';
import { Deps } from '@core/dep/deps';
import { TaskFilters, TaskFiltersData } from '@core/entity/filters';
import { Task } from '@core/entity/task';
import { User } from '@core/entity/user';

import styles from './FilterList.component.module.scss';
import { getShortName } from './format';

const DATE_PICKER_Z_INDEX = 101;

interface Props {
    deps: Deps;
    teamMembers: User[];
    taskFiltersData: TaskFiltersData;
    taskFilters: TaskFilters;
    onTaskFiltersDataChange?: (taskFiltersData: TaskFiltersData) => void;
    onTaskFiltersChange?: (taskFilters: TaskFilters) => void;
}

interface State {
    selectedTaskOwners: Set<string>;
}

export class FilterListComponent extends Component<Props, State> {
    private startDataPickerRef = createRef<DateTextPickerUI>();
    private endDataPickerRef = createRef<DateTextPickerUI>();

    constructor(props: Props) {
        super(props);
        this.state = {
            selectedTaskOwners: props.taskFiltersData.selectedTaskOwners,
        };
    }

    render() {
        return (
            <div className={styles.Section}>
                <div className={styles.TopBar}>
                    <div className={styles.Title}>Task Filters</div>
                    <SpacerUI />
                    <div className={styles.Actions}>
                        {/*<div*/}
                        {/*    className={styles.Action}*/}
                        {/*    onClick={this.onSaveFiltersClick}*/}
                        {/*>*/}
                        {/*    Save*/}
                        {/*</div>*/}
                    </div>
                </div>
                <div className={styles.Content}>
                    {this.renderTimeRangeFilterGroup()}
                    {this.renderTaskOwnerFilterGroup()}
                </div>
            </div>
        );
    }

    public async componentDidMount() {}

    private renderTimeRangeFilterGroup() {
        return (
            <div className={styles.Group}>
                <div className={styles.GroupName}>Time Range:</div>
                <div className={styles.GroupContent}>
                    <div className={`${styles.Input} ${styles.TextField}`}>
                        <DateTextPickerUI
                            ref={this.startDataPickerRef}
                            relativeLayout={this.props.deps.relativeLayout}
                            value={this.props.taskFiltersData.startDate}
                            label={'Start'}
                            onChange={this.onStartDateChange}
                            zOffset={DATE_PICKER_Z_INDEX}
                        />
                    </div>
                    <div className={`${styles.Input} ${styles.TextField}`}>
                        <DateTextPickerUI
                            ref={this.endDataPickerRef}
                            relativeLayout={this.props.deps.relativeLayout}
                            value={this.props.taskFiltersData.endDate}
                            label={'End'}
                            onChange={this.onEndDateChange}
                            zOffset={DATE_PICKER_Z_INDEX}
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
                            value={userAll}
                            checked={this.state.selectedTaskOwners.has(userAll)}
                            onChange={this.onTaskOwnersCheckBoxChange}
                        />
                        <div className={styles.Label}>All</div>
                    </div>
                    {this.props.teamMembers.map(this.renderOption)}
                    <div className={`${styles.Input} ${styles.Option}`}>
                        <input
                            type={'checkbox'}
                            className={styles.Checkbox}
                            value={userUnassigned}
                            checked={this.state.selectedTaskOwners.has(
                                userUnassigned,
                            )}
                            onChange={this.onTaskOwnersCheckBoxChange}
                        />
                        <div className={styles.Label}>Unassigned</div>
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
                {getShortName(user.firstName, user.lastName)}
            </div>
        </div>
    );

    private onTaskOwnersCheckBoxChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const value = event.currentTarget.value;
        const hasValue = this.state.selectedTaskOwners.has(value);
        if (value === userAll) {
            this.state.selectedTaskOwners.clear();
        } else {
            this.state.selectedTaskOwners.delete(userAll);
        }

        if (!hasValue) {
            this.state.selectedTaskOwners.add(value);
        } else {
            this.state.selectedTaskOwners.delete(value);
        }

        this.forceUpdate();
        this.props.onTaskFiltersDataChange?.call(
            null,
            Object.assign<any, TaskFiltersData, Partial<TaskFiltersData>>(
                {},
                this.props.taskFiltersData,
                {
                    selectedTaskOwners: this.state.selectedTaskOwners,
                },
            ),
        );
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

    private onStartDateChange = (date?: Date) => {
        const endDate = this.endDataPickerRef.current?.value || null;
        this.props.onTaskFiltersDataChange?.call(
            null,
            Object.assign<any, TaskFiltersData, Partial<TaskFiltersData>>(
                {},
                this.props.taskFiltersData,
                {
                    startDate: date,
                },
            ),
        );
        this.props.onTaskFiltersChange?.call(
            null,
            Object.assign<any, TaskFilters, Partial<TaskFilters>>(
                {},
                this.props.taskFilters,
                {
                    timeRangeFilter: between(
                        date || null,
                        endDate,
                        (task: Task) => task.dueAt,
                    ),
                },
            ),
        );
    };

    private onEndDateChange = (date?: Date) => {
        const startDate = this.startDataPickerRef.current?.value || null;
        this.props.onTaskFiltersDataChange?.call(
            null,
            Object.assign<any, TaskFiltersData, Partial<TaskFiltersData>>(
                {},
                this.props.taskFiltersData,
                {
                    endDate: date,
                },
            ),
        );
        this.props.onTaskFiltersChange?.call(
            null,
            Object.assign<any, TaskFilters, Partial<TaskFilters>>(
                {},
                this.props.taskFilters,
                {
                    timeRangeFilter: between(
                        startDate,
                        date || null,
                        (task: Task) => task.dueAt,
                    ),
                },
            ),
        );
    };

    private onSaveFiltersClick = () => {
        console.log('onSaveFiltersClick');
    };

    private getTaskOwnerFilter(): Filter<Task> {
        if (this.state.selectedTaskOwners.has(userAll)) {
            return allTasks;
        }

        const filters = Array.from(this.state.selectedTaskOwners).map(
            (key: string): Filter<Task> => {
                if (key === userUnassigned) {
                    return (task: Task) => !task.owner || task.owner.id === -1;
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
}
