import React, { Component, createRef } from 'react';
import { between } from '@core/data/task.filter';
import { DateTextPickerUI } from '@lib/ui/DateTextPicker';
import { SpacerUI } from '@lib/ui/Spacer';
import { Deps } from '@core/dep/deps';
import { TaskFilters, TaskFiltersData } from '@core/entity/filters';
import { Task } from '@core/entity/task';
import { TeamMember } from '@core/entity/teamMember';

import styles from './FilterList.component.module.scss';


const DATE_PICKER_Z_INDEX = 101;

interface Props {
    deps: Deps;
    teamMembers: TeamMember[];
    taskFiltersData: TaskFiltersData;
    taskFilters: TaskFilters;
    onTaskFiltersDataChange?: (taskFiltersData: TaskFiltersData) => void;
    onTaskFiltersChange?: (taskFilters: TaskFilters) => void;
}

export class FilterListComponent extends Component<Props> {
    private startDataPickerRef = createRef<DateTextPickerUI>();
    private endDataPickerRef = createRef<DateTextPickerUI>();

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
                </div>
            </div>
        );
    }

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

    private onSaveFiltersClick = () => {
        console.log('onSaveFiltersClick');
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
}
