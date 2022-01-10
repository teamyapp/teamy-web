import React, { ChangeEvent, Component, createRef } from 'react';

import { DatePickerUI } from '@lib/ui/DatePicker';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { SpacerUI } from '@lib/ui/Spacer';
import { TooltipUI } from '@lib/ui/Tooltip';

import { Deps } from '@core/dep/deps';
import { User } from '@core/entity/user';
import { FormatService } from '@core/service/format.service';

import styles from './FilterList.component.module.scss';

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

    constructor(props: Props) {
        super(props);
        this.state = {
            teamMembers: [],
            selectedTaskOwners: new Set<string>(),
        };
    }

    render() {
        return (
            <div className={styles.Section}>
                <div className={styles.TopBar}>
                    <div className={styles.Title}>Filters</div>
                    <SpacerUI />
                    <div className={styles.Actions}>
                        <TooltipUI message={'Apply'}>
                            <div
                                className={styles.Action}
                                onClick={this.onApplyFiltersClick}
                            >
                                <MaterialIconUI>check_circle</MaterialIconUI>
                            </div>
                        </TooltipUI>
                    </div>
                </div>
                <div className={styles.Content}>
                    <div className={styles.Group}>
                        <div className={styles.GroupName}>Time Range:</div>
                        <div className={styles.GroupContent}>
                            <div className={styles.Input}>
                                <DatePickerUI
                                    ref={this.startDataPickerRef}
                                    label={'Start'}
                                />
                            </div>
                            <div className={styles.Input}>
                                <DatePickerUI
                                    ref={this.endDataPickerRef}
                                    label={'End'}
                                />
                            </div>
                        </div>
                    </div>
                    {this.renderTaskOwnerFilterGroup()}
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

    private renderTaskOwnerFilterGroup() {
        return (
            <div className={styles.Group}>
                <div className={styles.GroupName}>Task Owner:</div>
                <div className={styles.GroupContent}>
                    <div className={`${styles.Input} ${styles.Option}`}>
                        <input
                            type={'checkbox'}
                            className={styles.Checkbox}
                            value={'all'}
                            checked={this.state.selectedTaskOwners.has('all')}
                            onChange={this.onTaskOwnersCheckBoxChange}
                        />
                        <div className={styles.Label}>All</div>
                    </div>
                    {this.state.teamMembers.map(this.renderOption)}
                    <div className={`${styles.Input} ${styles.Option}`}>
                        <input
                            type={'checkbox'}
                            className={styles.Checkbox}
                            value={'unassigned'}
                            checked={this.state.selectedTaskOwners.has(
                                'unassigned',
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
                value={`user/${user.id}`}
                checked={this.state.selectedTaskOwners.has(`user/${user.id}`)}
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
        if (value === 'all') {
            this.state.selectedTaskOwners.clear();
        } else {
            this.state.selectedTaskOwners.delete('all');
        }

        if (!hasValue) {
            this.state.selectedTaskOwners.add(value);
        } else {
            this.state.selectedTaskOwners.delete(value);
        }

        this.forceUpdate();
    };

    private onApplyFiltersClick = () => {
        // TODO: connect with local store
        // const startDate = this.startDataPickerRef.current?.value;
        // const endDate = this.endDataPickerRef.current?.value;
    };
}
