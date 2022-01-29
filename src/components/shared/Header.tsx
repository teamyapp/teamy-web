import classNames from 'classnames';
import React, { Component } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { SpacerUI } from '@lib/ui/Spacer';
import { TooltipUI } from '@lib/ui/Tooltip';

import { User } from '@core/entity/user';

import styles from './Header.module.scss';
import { UserProfileUI } from './UserProfile';

interface Props {
    me: User;
    isDrawerOpen: boolean;
    onMenuToggle?: () => void;
    onFilterActionClick?: () => void;
    onUserProfileClick?: () => void;
}

interface State {
    showFiltersSection: boolean;
}

export class HeaderUI extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showFiltersSection: false,
        };
    }

    render() {
        return (
            <header className={styles.Header}>
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
                    {this.props.me.activeTeam?.name}
                </div>
                <SpacerUI />
                <div className={styles.UserActionSection}>
                    <TooltipUI message={'Filters'}>
                        <div
                            className={`${styles.Action} ${classNames({
                                [styles.Active]: this.state.showFiltersSection,
                            })}`}
                            onClick={this.onFilterActionClick}
                        >
                            <MaterialIconUI>filter_alt</MaterialIconUI>
                        </div>
                    </TooltipUI>
                </div>
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
            </header>
        );
    }

    onFilterActionClick = () => {
        this.setState({
            showFiltersSection: !this.state.showFiltersSection,
        });
        this.props.onFilterActionClick?.call(null);
    };
}
