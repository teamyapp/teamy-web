import React, { Component } from 'react';

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
}

export class FilterListComponent extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            teamMembers: [],
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
                            <div className={styles.Action}>
                                <MaterialIconUI>check_circle</MaterialIconUI>
                            </div>
                        </TooltipUI>
                    </div>
                </div>
                <div className={styles.Content}>
                    <div className={styles.Group}>
                        <div className={styles.GroupName}>Time Range: </div>
                        <div className={styles.GroupContent}>
                            <div className={styles.Input}>
                                <DatePickerUI label={'Start'} />
                            </div>
                            <div className={styles.Input}>
                                <DatePickerUI label={'End'} />
                            </div>
                        </div>
                    </div>
                    {this.renderTaskOwnerFilterGroup()}
                </div>
            </div>
        );
    }

    private renderTaskOwnerFilterGroup() {
        return (
            <div className={styles.Group}>
                <div className={styles.GroupName}>Task Owner: </div>
                <div className={styles.GroupContent}>
                    <div className={`${styles.Input} ${styles.Option}`}>
                        <input
                            type={'checkbox'}
                            className={styles.Checkbox}
                            value={'all'}
                        />
                        <div className={styles.Label}>All</div>
                    </div>
                    {this.state.teamMembers.map(this.renderOption)}
                    <div className={`${styles.Input} ${styles.Option}`}>
                        <input
                            type={'checkbox'}
                            className={styles.Checkbox}
                            value={'unassigned'}
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
            />
            <div className={styles.Label}>
                {FormatService.getShortName(user.firstName, user.lastName)}
            </div>
        </div>
    );

    public async componentDidMount() {
        const teamMembers =
            await this.props.deps.teamService.fetchTeamMembers();
        this.setState({
            teamMembers,
        });
    }
}
