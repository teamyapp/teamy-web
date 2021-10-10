import classNames from 'classnames';
import React, { Component } from 'react';
import Team from '../entity/Team';
import styles from './Drawer.component.module.scss';
import MaterialIconComponent from './ui/MaterialIcon.component';

const teams: Team[] = [
    {
        iconUrl: 'teams/teamy.svg',
        name: 'Teamy',
    },
    {
        iconUrl: 'teams/amazon.svg',
        name: 'Amazon',
    },
    {
        iconUrl: 'teams/apple.svg',
        name: 'Apple',
    },
    {
        iconUrl: 'teams/facebook.svg',
        name: 'Facebook',
    },
    {
        iconUrl: 'teams/google.svg',
        name: 'Google',
    },
    {
        iconUrl: 'teams/microsoft.svg',
        name: 'Microsoft',
    },
    {
        iconUrl: 'teams/tesla.svg',
        name: 'Tesla',
    },
];

interface OnMenuCloseHandler {
    (): void;
}

interface IProps {
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
                    {teams.map((team: Team, index: number) => (
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
        if (this.props.onMenuClose) {
            this.props.onMenuClose();
        }
    };
}
