import classNames from 'classnames';
import React, { Component } from 'react';
import Team from '../entity/Team';
import styles from './Drawer.component.module.scss';
import MaterialIconComponent from './ui/MaterialIcon.component';

interface OnMenuCloseHandler {
    (): void;
}

interface IProps {
    teams: Team[];
    onMenuClose?: OnMenuCloseHandler;
    isDrawerOpen: boolean;
}

interface IState {
    activeTeamIndex: number;
}

export default class DrawerComponent extends Component<IProps, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            activeTeamIndex: 0,
        };
    }

    render = () => {
        return (
            <div
                className={`${styles.Drawer} ${classNames({
                    [styles.Show]: this.props.isDrawerOpen,
                })}`}
            >
                <div className={styles.Header}>
                    <div className={styles.MenuButtonPlaceHolder}>
                        {this.props.isDrawerOpen && (
                            <div
                                className={styles.MenuButton}
                                onClick={this.onMenuToggle}
                            >
                                <MaterialIconComponent>
                                    menu_open
                                </MaterialIconComponent>
                            </div>
                        )}
                    </div>
                </div>
                <div className={styles.Teams}>
                    {this.props.teams.map((team: Team, index: number) => (
                        <div
                            className={`${styles.Team} ${classNames({
                                [styles.Active]:
                                    this.state.activeTeamIndex === index,
                            })}`}
                            key={index}
                        >
                            <div className={styles.IconFrame}>
                                <img
                                    className={styles.Icon}
                                    src={team.logoUrl}
                                    alt={team.name}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    onMenuToggle = () => {
        this.props.onMenuClose?.call(this);
    };
}
