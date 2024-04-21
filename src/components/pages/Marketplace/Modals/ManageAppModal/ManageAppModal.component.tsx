import classNames from 'classnames';
import React, { Component, ReactNode, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';

import { Deps } from '@core/dep/deps';
import { App } from '@core/entity/app';
import { GraphSource } from '@core/storage/graph/graphSource';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import { UserProfileUI } from '../../../../internal/UserProfile';
import { getUserShortName } from '../../../../internal/format';
import { CredentialTabComponent } from './CredentialTab.component';
import { GroupsTabComponent } from './GroupsTab.component';
import styles from './ManageAppModal.component.module.scss';
import { RolloutsTabComponent } from './RolloutsTab.component';
import { TagsTabComponent } from './TagsTab.component';
import { VersionsTabComponent } from './VersionsTab.component';

type TabKey = 'credentials' | 'versions' | 'groups' | 'rollouts' | 'tags';

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
    {
        name: 'Tags',
        key: 'tags',
    },
];

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
    private readonly stateSyncer: StateSyncer;

    constructor(props: Props) {
        super(props);
        this.graphSource = props.deps.graphSource;
        this.stateSyncer = props.deps.stateSyncer;
        this.state = {
            showTabViews: {
                credentials: true,
                versions: false,
                groups: false,
                rollouts: false,
                tags: false,
            },
        };
    }

    render() {
        const currTeamId = this.props.deps.graphSource.currentTeam()?.id;
        const latestTeamAppVersion =
            this.state.app?.latestVersionForTeam(currTeamId);
        if (!latestTeamAppVersion) {
            return null;
        }

        return (
            this.state.app && (
                <ModalUI ref={this.modalRef}>
                    <>
                        <div className={styles.Header}>
                            Manage {latestTeamAppVersion.appName} App
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
        const app = this.graphSource.app(appId);
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
                        tags: false,
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
                this.state.app && (
                    <VersionsTabComponent
                        deps={this.props.deps}
                        appId={this.state.app.id}
                        onCreateVersionClick={this.onCreateVersionClick}
                        onDeleteVersionClick={this.onDeleteVersionClick}
                    />
                )
            );
        } else if (this.state.showTabViews['groups']) {
            return (
                this.state.app && (
                    <GroupsTabComponent
                        deps={this.props.deps}
                        appId={this.state.app.id}
                        isValidUser={this.isValidUser}
                        isValidTeam={this.isValidTeam}
                        renderInlineUser={this.renderInlineUser}
                        renderInlineTeam={this.renderInlineTeam}
                    />
                )
            );
        } else if (this.state.showTabViews['rollouts']) {
            return (
                this.state.app && (
                    <RolloutsTabComponent
                        deps={this.props.deps}
                        appId={this.state.app.id}
                        isValidVersionNumber={this.isValidVersionNumber}
                        renderInlineVersionNumber={
                            this.renderInlineVersionNumber
                        }
                    />
                )
            );
        } else if (this.state.showTabViews['tags']) {
            return (
                this.state.app && (
                    <TagsTabComponent
                        appId={this.state.app.id}
                        tags={this.state.app.tags}
                        deps={this.props.deps}
                    />
                )
            );
        }

        return;
    }

    private renderInlineUser = (userId: number): ReactNode => {
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

    private isValidUser = async (userId: number): Promise<boolean> => {
        await this.stateSyncer.pullUser(userId);
        return Boolean(this.graphSource.user(userId));
    };

    private isValidTeam = async (teamId: number): Promise<boolean> => {
        await this.stateSyncer.pullTeam(teamId);
        return Boolean(this.graphSource.team(teamId));
    };

    private renderInlineTeam = (teamId: number): ReactNode => {
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

    private isValidVersionNumber = async (
        versionNumber: number,
    ): Promise<boolean> => {
        return (
            this.state.app?.versions.some(
                (appVersion) => appVersion.number == versionNumber,
            ) || false
        );
    };

    private renderInlineVersionNumber = (versionNumber: number): ReactNode => {
        const appVersion = this.state.app?.versions.find(
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

    private onCreateVersionClick = async (): Promise<number> => {
        return await this.props.deps.stateSyncer.createAppVersion(
            this.state.app!.id,
        );
    };

    private onDeleteVersionClick = (versionNumber: number) => {
        if (!this.state.app) {
            return;
        }

        this.props.deps.stateSyncer.deleteAppVersion(
            this.state.app.id,
            versionNumber,
        );
    };
}
