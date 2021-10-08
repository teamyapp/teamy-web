import React, { Component } from 'react';
import styles from './Drawer.component.module.scss';
import Team from '../enity/Team';

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

export default class DrawerComponent extends Component {
    render = () => {
        return (
            <div className={styles.Drawer}>
                <div className={styles.Header}>
                    {/* TODO: Drawer header detail */}
                </div>
                <div className={styles.Teams}>
                    {teams.map((team: Team, index: number) => (
                        <div className={styles.Team} key={index}>
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
}
