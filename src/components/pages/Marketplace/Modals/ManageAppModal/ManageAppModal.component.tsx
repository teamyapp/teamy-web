import classNames from 'classnames';
import React, { Component, ReactNode, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';

import { Deps } from '@core/dep/deps';
import { GraphSource } from '@core/storage/graph/graphSource';

import { UserProfileUI } from '../../../../internal/UserProfile';
import { getUserShortName } from '../../../../internal/format';
import { CredentialTabComponent } from './CredentialTab.component';
import { GroupsTabComponent } from './GroupsTab.component';
import styles from './ManageAppModal.component.module.scss';
import { RolloutsTabComponent } from './RolloutsTab.component';
import { VersionsTabComponent } from './VersionsTab.component';
import { appVersions } from './data';

type TabKey = 'credentials' | 'versions' | 'groups' | 'rollouts';

interface Tab<Key> {
    name: string;
    key: Key;
}

const tabs: Tab<TabKey>[] = [
    {
        name: 'Credentials',
        key: 'credentials',
    },
    {
        name: 'Versions',
        key: 'versions',
    },
    {
        name: 'Groups',
        key: 'groups',
    },
    {
        name: 'Rollouts',
        key: 'rollouts',
    },
];

interface App {
    id: number;
    name: string;
}

const apps: Record<number, App> = {
    1: {
        id: 1,
        name: 'Github',
    },
};

interface Props {
    deps: Deps;
}

interface State {
    app?: App;
    showTabViews: Record<TabKey, boolean>;
}

export class ManageAppModalComponent extends Component<Props, State> {
    private readonly modalRef = createRef<ModalUI>();
    private readonly graphSource: GraphSource;

    constructor(props: Props) {
        super(props);
        this.graphSource = props.deps.graphSource;
        this.state = {
            showTabViews: {
                credentials: true,
                versions: false,
                groups: false,
                rollouts: false,
            },
        };
    }

    render() {
        return (
            this.state.app && (
                <ModalUI ref={this.modalRef}>
                    <>
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
                                            className={`${
                                                styles.Tab
                                            } ${classNames({
                                                [styles.Active]:
                                                    this.state.showTabViews[
                                                        tab.key
                                                    ],
                                            })}`}
                                            onClick={this.onTabClickHandler(
                                                tab,
                                            )}
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
                    </>
                </ModalUI>
            )
        );
    }

    open(appId: number) {
        const app = apps[appId];
        this.setState(
            {
                app: app,
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

    onTabClickHandler = (tab: Tab<TabKey>) => {
        return () => {
            this.setState({
                showTabViews: Object.assign(
                    {
                        credentials: false,
                        versions: false,
                        groups: false,
                        rollouts: false,
                    },
                    {
                        [tab.key]: true,
                    },
                ),
            });
        };
    };

    renderTab() {
        if (this.state.showTabViews['credentials']) {
            return (
                this.state.app && (
                    <CredentialTabComponent
                        deps={this.props.deps}
                        appId={this.state.app.id}
                    />
                )
            );
        } else if (this.state.showTabViews['versions']) {
            return (
                <VersionsTabComponent
                    onCreateVersionClick={this.onCreateVersionClick}
                />
            );
        } else if (this.state.showTabViews['groups']) {
            return (
                this.state.app && (
                    <GroupsTabComponent
                        deps={this.props.deps}
                        appId={this.state.app.id}
                        isValidUser={this.isValidUser}
                        isValidTeam={this.isValidUser}
                        renderInlineUser={this.renderInlineUser}
                        renderInlineTeam={this.renderInlineTeam}
                    />
                )
            );
        } else if (this.state.showTabViews['rollouts']) {
            return (
                <RolloutsTabComponent
                    isValidVersionNumber={this.isValidVersionNumber}
                    renderInlineVersionNumber={this.renderInlineVersionNumber}
                />
            );
        }

        return;
    }

    private renderInlineUser = (userId: number): ReactNode => {
        // TODO: pull user
        let user = this.graphSource.user(userId);
        return (
            user && (
                <div className={styles.InlineUser}>
                    <div className={styles.Profile}>
                        <UserProfileUI user={user} />
                    </div>
                    <div className={styles.Name}>
                        {getUserShortName(user.firstName, user.lastName)}
                    </div>
                </div>
            )
        );
    };

    private isValidUser = (userId: number): boolean => {
        // TODO: pull user
        return this.graphSource.user(userId) !== undefined;
    };

    private renderInlineTeam = (teamId: number): ReactNode => {
        // TODO: pull team
        let team = this.graphSource.team(teamId);
        return (
            team && (
                <div className={styles.InlineTeam}>
                    <div className={styles.Icon}>
                        {team.iconUrl ? (
                            <img src={team.iconUrl} alt={team.name} />
                        ) : (
                            <div className={styles.IconDefault}>
                                {team.name[0].toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className={styles.Name}>{team.name}</div>
                </div>
            )
        );
    };

    private isValidVersionNumber = (versionNumber: number): boolean => {
        return appVersions.some(
            (appVersion) => appVersion.number == versionNumber,
        );
    };

    private renderInlineVersionNumber = (versionNumber: number): ReactNode => {
        const appVersion = appVersions.find(
            (appVersion) => appVersion.number == versionNumber,
        );
        return (
            appVersion && (
                <div className={styles.InlineVersionNumber}>
                    {appVersion.number}
                </div>
            )
        );
    };

    private onCreateVersionClick = (): number => {
        //TODO: create new version
        return 0;
    };
}
