import classNames from 'classnames';
import moment from 'moment';
import React, { Component, RefObject, createRef } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';

import { User } from '@core/entity/user';

import { getUserShortName } from '../../../internal/format';
import github2IconImg from '../assets/github2.png';
import githubIconImg from '../assets/github.png';
import styles from './ManageAppModal.component.module.scss';

interface Tab {
    name: string;
    key: string;
}

const tabs: Tab[] = [
    {
        name: 'General',
        key: 'general',
    },
    {
        name: 'Versions',
        key: 'versions',
    },
    {
        name: 'Rollouts',
        key: 'rollouts',
    },
];

interface ApiToken {
    id: number;
    name: string;
    addedAt: Date;
    addedBy: User;
    lastUsedAt?: Date;
}

const apiTokens: ApiToken[] = [
    {
        id: 1,
        name: 'Backend',
        addedAt: moment().subtract(2, 'week').toDate(),
        addedBy: {
            id: 1,
            firstName: 'Harry',
            lastName: 'Liu',
            fullName: 'Harry Liu',
            profileUrl: '',
            teams: [],
            linkedUsers: [],
        },
    },
    {
        id: 1,
        name: 'Harry Mac Dev',
        addedAt: moment().subtract(1, 'week').toDate(),
        addedBy: {
            id: 1,
            firstName: 'Xianbo',
            lastName: 'Duan',
            fullName: 'Xianbo Duan',
            profileUrl: '',
            teams: [],
            linkedUsers: [],
        },
        lastUsedAt: moment().subtract(2, 'd').toDate(),
    },
];

interface AppVersion {
    number: number;
    appName: string;
    appDescription: string;
    iconUrl: string;
    changes: string[];
    createdAt: Date;
}

const appVersions: AppVersion[] = [
    {
        number: 1,
        appName: 'GH',
        appDescription: 'Github integration',
        iconUrl: github2IconImg,
        changes: ['Create initial version of app'],
        createdAt: moment().subtract('2', 'd').toDate(),
    },
    {
        number: 2,
        appName: 'Github',
        appDescription: 'Github integration for Teamy',
        iconUrl: githubIconImg,
        changes: ['Use a new icon for the app', 'Clarified app description'],
        createdAt: moment().subtract('1', 'd').toDate(),
    },
];

interface App {
    id: number;
    name: string;
}

interface Props {}

interface State {
    app?: App;
    appVersion?: AppVersion;
    showTabViews: Record<string, boolean>;
}

const apps: Record<number, App> = {
    1: {
        id: 1,
        name: 'Github',
    },
};

export class ManageAppModalComponent extends Component<Props, State> {
    private readonly modalRef: RefObject<ModalUI> = createRef();

    constructor(props: Props) {
        super(props);
        this.state = {
            showTabViews: {},
        };
    }

    componentDidMount() {
        this.setState({
            showTabViews: {
                [tabs[0].key]: true,
            },
        });
    }

    render() {
        return (
            this.state.app && (
                <ModalUI ref={this.modalRef}>
                    <div className={styles.Header}>
                        Manage {this.state.app.name} App
                        <div
                            role={'button'}
                            aria-label={'Close'}
                            className={styles.CloseButton}
                            onClick={this.onCloseButtonClick}
                        >
                            <MaterialIconUI>cancel</MaterialIconUI>
                        </div>
                    </div>
                    <div className={styles.Content}>
                        <div className={styles.LeftSection}>
                            <div className={styles.Tabs}>
                                {tabs.map((tab) => (
                                    <div
                                        key={tab.key}
                                        className={`${styles.Tab} ${classNames({
                                            [styles.Active]:
                                                this.state.showTabViews[
                                                    tab.key
                                                ],
                                        })}`}
                                        onClick={this.onTabClickHandler(tab)}
                                    >
                                        {tab.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.Divider} />
                        <div className={styles.RightSection}>
                            {this.renderTab()}
                        </div>
                    </div>
                </ModalUI>
            )
        );
    }

    open(appId: number) {
        this.setState(
            {
                app: apps[appId],
            },
            () => {
                this.modalRef.current?.open();
            },
        );
    }

    close() {
        this.modalRef.current?.close();
    }

    onCloseButtonClick = () => {
        this.modalRef.current?.close();
    };

    onTabClickHandler = (tab: Tab) => {
        return () => {
            this.setState({
                showTabViews: {
                    [tab.key]: true,
                },
            });
        };
    };

    renderTab() {
        if (this.state.showTabViews[tabs[0].key]) {
            return this.renderGeneralTab();
        } else if (this.state.showTabViews[tabs[1].key]) {
            return this.renderVersionsTab();
        }

        return;
    }

    onVersionNumberClickHandler = (appVersion: AppVersion) => {
        return () => {
            this.setState({
                appVersion: appVersion,
            });
        };
    };

    private renderGeneralTab() {
        return (
            <div className={styles.GeneralTab}>
                <div className={styles.Section}>
                    <div className={styles.Row}>
                        <span className={`${styles.Label} ${styles.SameRow}`}>
                            App ID:
                        </span>
                        {this.state.app!.id}
                    </div>
                </div>
                <div className={styles.Divider} />
                <div className={styles.Section}>
                    <div className={styles.TitleRow}>
                        <div className={styles.Title}>API Tokens</div>
                        <div className={styles.Spacer} />
                        <div className={styles.Actions}>
                            <div
                                className={`${styles.Action} ${styles.CreateToken}`}
                            >
                                Create token
                            </div>
                        </div>
                    </div>
                    <table className={styles.ApiTokenTable}>
                        <thead>
                            <tr>
                                <th className={`${styles.Cell} ${styles.Name}`}>
                                    Name
                                </th>
                                <th>Added at</th>
                                <th>Added by</th>
                                <th>Last used</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apiTokens.map((token) => (
                                <tr className={styles.TokenRow}>
                                    <td
                                        className={`${styles.Cell} ${styles.Name}`}
                                    >
                                        {token.name}
                                    </td>
                                    <td>{moment(token.addedAt).fromNow()}</td>
                                    <td>
                                        {getUserShortName(
                                            token.addedBy.firstName,
                                            token.addedBy.lastName,
                                        )}
                                    </td>
                                    <td>
                                        {token.lastUsedAt
                                            ? moment(token.lastUsedAt).fromNow()
                                            : 'Never'}
                                    </td>
                                    <td>
                                        <div
                                            className={`${styles.Action} ${styles.Delete}`}
                                        >
                                            <MaterialIconUI
                                                iconStyle={'outlined'}
                                            >
                                                remove_circle
                                            </MaterialIconUI>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    private renderVersionsTab() {
        return (
            <div className={styles.VersionsTab}>
                <div className={styles.VersionsSection}>
                    <div className={`${styles.Action} ${styles.CreateVersion}`}>
                        Create Version
                    </div>
                    <div className={styles.VersionList}>
                        {appVersions
                            .sort(
                                (appVersion1, appVersion2) =>
                                    appVersion2.number - appVersion1.number,
                            )
                            .map((appVersion) => (
                                <div
                                    className={`${
                                        styles.AppVersion
                                    } ${classNames({
                                        [styles.Active]:
                                            appVersion.number ==
                                            this.state.appVersion?.number,
                                    })}`}
                                    onClick={this.onVersionNumberClickHandler(
                                        appVersion,
                                    )}
                                >
                                    {appVersion.number}
                                </div>
                            ))}
                    </div>
                </div>
                <div className={styles.AppVersionDetail}>
                    {this.state.appVersion && (
                        <div className={styles.Box}>
                            <div className={`${styles.Row} ${styles.Icon}`}>
                                <img
                                    className={styles.Icon}
                                    src={this.state.appVersion.iconUrl}
                                />
                            </div>
                            <div className={`${styles.Row} ${styles.Name}`}>
                                <span
                                    className={`${styles.Label} ${styles.SameRow}`}
                                >
                                    Name:
                                </span>
                                {this.state.appVersion.appName}
                            </div>
                            <div
                                className={`${styles.Row} ${styles.Description}`}
                            >
                                <span
                                    className={`${styles.Label} ${styles.SameRow}`}
                                >
                                    Description:
                                </span>
                                {this.state.appVersion.appDescription}
                            </div>
                            <div className={`${styles.Row} ${styles.Changes}`}>
                                <div
                                    className={`${styles.Label} ${styles.NextRow}`}
                                >
                                    Changes:
                                </div>
                                <div className={styles.ChangeList}>
                                    {this.state.appVersion.changes.map(
                                        (change) => (
                                            <div className={styles.Change}>
                                                {change}
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                            <div
                                className={`${styles.Row} ${styles.CreatedAt}`}
                            >
                                <span
                                    className={`${styles.Label} ${styles.SameRow}`}
                                >
                                    Created at:
                                </span>
                                {moment(this.state.appVersion.createdAt).format(
                                    'l LT',
                                )}
                            </div>
                            <div className={`${styles.Row} ${styles.Buttons}`}>
                                <div className={styles.Download}>
                                    <ButtonUI label={'Download'} />
                                </div>
                                <div className={styles.Delete}>
                                    <ButtonUI label={'Delete'} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
