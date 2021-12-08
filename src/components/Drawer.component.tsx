import classNames from 'classnames';
import React, { Component } from 'react';
import Team from '../entity/Team';
import styles from './Drawer.component.module.scss';
import MaterialIconComponent from './ui/MaterialIcon.component';

interface IProps {
    teams: Team[];
    activeTeamId: number;
    onMenuClose?: () => void;
    onActiveTeamSelect?: (teamId: number) => void;
    isDrawerOpen: boolean;
}

export default class DrawerComponent extends Component<IProps> {
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
                                    this.props.activeTeamId === team.id,
                            })}`}
                            key={index}
                        >
                            <div
                                className={styles.IconFrame}
                                onClick={this.onTeamClick(team.id)}
                            >
                                <img
                                    className={styles.Icon}
                                    src={team.iconUrl}
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
        this.props.onMenuClose?.call(null);
    };

    onTeamClick = (teamId: number): (() => void) => {
        return () => {
            this.props.onActiveTeamSelect?.call(null, teamId);
        };
    };
}
