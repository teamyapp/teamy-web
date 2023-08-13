import classNames from 'classnames';
import moment from 'moment';
import React, { Component, ReactNode, RefObject, createRef } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';

import { User } from '@core/entity/user';

import { getUserShortName } from '../../../internal/format';
import github2IconImg from '../assets/github2.png';
import githubIconImg from '../assets/github.png';
import styles from './ManageAppModal.component.module.scss';

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

type RolloutGroupTabKey = 'users' | 'teams';

const rolloutGroupTabs: Tab<RolloutGroupTabKey>[] = [
    {
        name: 'Users',
        key: 'users',
    },
    {
        name: 'Teams',
        key: 'teams',
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
    {
        number: 3,
        appName: 'Github',
        appDescription: 'Github integration for Teamy',
        iconUrl: githubIconImg,
        changes: ['Support pull request automation'],
        createdAt: moment().subtract('1', 'd').toDate(),
    },
];

interface UserGroup {
    id: number;
    name: string;
    filter: string;
    createdAt: Date;
}

const userGroups: UserGroup[] = [
    {
        id: 1,
        name: 'US Software Engineer',
        filter: '(country=US) or (jobTitle=software engineer)',
        createdAt: new Date(),
    },
    {
        id: 2,
        name: 'US Teenager',
        filter: '(country=US) and (age>18) and (age<26)',
        createdAt: new Date(),
    },
];

interface TeamGroup {
    id: number;
    name: string;
    filter: string;
    createdAt: Date;
}

const teamGroups: TeamGroup[] = [
    {
        id: 1,
        name: 'US Technology',
        filter: '(country=US) AND ((industry=software) or (industry=hardware))',
        createdAt: new Date(),
    },
    {
        id: 2,
        name: 'US Massachusetts',
        filter: '(country=US) AND (state=MA)',
        createdAt: new Date(),
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

interface StaticRollout<Group> {
    id: number;
    type: 'static';
    name: string;
    version: AppVersion;
    createdAt: Date;
    groups: Group[];
}

interface TimeRangeRollout<Group> {
    id: number;
    type: 'timeRange';
    name: string;
    version: AppVersion;
    startAt?: Date;
    endAt?: Date;
    createdAt: Date;
    groups: Group[];
}

interface ExperimentRollout<Group> {
    id: number;
    type: 'experiment';
    name: string;
    versions: AppVersion[];
    startAt?: Date;
    endAt?: Date;
    createdAt: Date;
    groups: Group[];
}

type Rollout<Group> =
    | StaticRollout<Group>
    | TimeRangeRollout<Group>
    | ExperimentRollout<Group>;

const userGroupRollouts: Rollout<UserGroup>[] = [
    {
        id: 1,
        type: 'static',
        name: 'Initial beta',
        version: appVersions[0],
        createdAt: new Date(),
        groups: [userGroups[0]],
    },
    {
        id: 2,
        type: 'timeRange',
        name: 'Black Friday deals',
        version: appVersions[0],
        startAt: moment().subtract(1, 'd').toDate(),
        endAt: moment().add(1, 'd').toDate(),
        createdAt: new Date(),
        groups: [userGroups[1]],
    },
    {
        id: 3,
        type: 'experiment',
        name: 'Banner Testing',
        versions: appVersions,
        startAt: moment().subtract(1, 'd').toDate(),
        endAt: moment().add(1, 'd').toDate(),
        createdAt: new Date(),
        groups: [userGroups[0], userGroups[1]],
    },
];

const teamGroupRollouts: Rollout<TeamGroup>[] = [
    {
        id: 4,
        type: 'experiment',
        name: 'Banner Testing',
        versions: appVersions,
        startAt: moment().subtract(1, 'd').toDate(),
        endAt: moment().add(1, 'd').toDate(),
        createdAt: new Date(),
        groups: [teamGroups[0], teamGroups[1]],
    },
];

interface Props {}

interface State {
    app?: App;
    selectedAppVersion?: AppVersion;
    selectedUserGroupRollout?: Rollout<UserGroup>;
    selectedTeamGroupRollout?: Rollout<TeamGroup>;
    showTabViews: Record<TabKey, boolean>;
    showRolloutGroupTabViews: Record<RolloutGroupTabKey, boolean>;
}

export class ManageAppModalComponent extends Component<Props, State> {
    private readonly modalRef: RefObject<ModalUI> = createRef();

    constructor(props: Props) {
        super(props);
        this.state = {
            showTabViews: {
                credentials: true,
                versions: false,
                groups: false,
                rollouts: false,
            },
            showRolloutGroupTabViews: {
                users: true,
                teams: false,
            },
        };
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
            return this.renderCredentialTab();
        } else if (this.state.showTabViews['versions']) {
            return this.renderVersionsTab();
        } else if (this.state.showTabViews['groups']) {
            return this.renderGroupsTab();
        } else if (this.state.showTabViews['rollouts']) {
            return this.renderRolloutsTab();
        }

        return;
    }

    onVersionNumberClickHandler = (appVersion: AppVersion) => {
        return () => {
            this.setState({
                selectedAppVersion: appVersion,
            });
        };
    };

    private renderCredentialTab() {
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
                    <table className={`${styles.Table} ${styles.ApiToken}`}>
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
                                    <td
                                        className={`${styles.Cell} ${styles.Actions}`}
                                    >
                                        <div
                                            className={`${styles.RowAction} ${styles.Delete}`}
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
                                            this.state.selectedAppVersion
                                                ?.number,
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
                    {this.state.selectedAppVersion && (
                        <div className={styles.Box}>
                            <div className={`${styles.Row} ${styles.Icon}`}>
                                <img
                                    className={styles.Icon}
                                    src={this.state.selectedAppVersion.iconUrl}
                                />
                            </div>
                            <div className={`${styles.Row} ${styles.Name}`}>
                                <span
                                    className={`${styles.Label} ${styles.SameRow}`}
                                >
                                    Name:
                                </span>
                                {this.state.selectedAppVersion.appName}
                            </div>
                            <div
                                className={`${styles.Row} ${styles.Description}`}
                            >
                                <span
                                    className={`${styles.Label} ${styles.SameRow}`}
                                >
                                    Description:
                                </span>
                                {this.state.selectedAppVersion.appDescription}
                            </div>
                            <div className={`${styles.Row} ${styles.Changes}`}>
                                <div
                                    className={`${styles.Label} ${styles.NextRow}`}
                                >
                                    Changes:
                                </div>
                                <div className={styles.ChangeList}>
                                    {this.state.selectedAppVersion.changes.map(
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
                                {moment(
                                    this.state.selectedAppVersion.createdAt,
                                ).format('l LT')}
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

    private renderGroupsTab(): ReactNode {
        return (
            <div className={styles.GroupsTab}>
                <div className={styles.Section}>
                    <div className={styles.TitleRow}>
                        <div className={styles.Title}>User Groups</div>
                        <div className={styles.Spacer} />
                        <div className={styles.Actions}>
                            <div
                                className={`${styles.Action} ${styles.CreateGroup}`}
                            >
                                Create group
                            </div>
                        </div>
                    </div>
                    <table className={`${styles.Table} `}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Group Name</th>
                                <th>Filter</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userGroups.map((userGroup) => (
                                <tr>
                                    <td
                                        className={`${styles.Cell} ${styles.Id}`}
                                    >
                                        {userGroup.id}
                                    </td>
                                    <td
                                        className={`${styles.Cell} ${styles.Name}`}
                                    >
                                        {userGroup.name}
                                    </td>
                                    <td
                                        className={`${styles.Cell} ${styles.Filter}`}
                                    >
                                        {userGroup.filter}
                                    </td>
                                    <td
                                        className={`${styles.Cell} ${styles.CreatedAt}`}
                                    >
                                        {moment(userGroup.createdAt).fromNow()}
                                    </td>
                                    <td
                                        className={`${styles.Cell} ${styles.Actions}`}
                                    >
                                        <div
                                            className={`${styles.RowAction} ${styles.Edit}`}
                                        >
                                            <MaterialIconUI
                                                iconStyle={'outlined'}
                                            >
                                                edit
                                            </MaterialIconUI>
                                        </div>
                                        <div
                                            className={`${styles.RowAction} ${styles.Delete}`}
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
                <div className={styles.Section}>
                    <div className={styles.TitleRow}>
                        <div className={styles.Title}>Team Groups</div>
                        <div className={styles.Spacer} />
                        <div className={styles.Actions}>
                            <div
                                className={`${styles.Action} ${styles.CreateGroup}`}
                            >
                                Create group
                            </div>
                        </div>
                    </div>
                    <table className={`${styles.Table}`}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Group Name</th>
                                <th>Filter</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamGroups.map((teamGroup) => (
                                <tr>
                                    <td
                                        className={`${styles.Cell} ${styles.Id}`}
                                    >
                                        {teamGroup.id}
                                    </td>
                                    <td
                                        className={`${styles.Cell} ${styles.Name}`}
                                    >
                                        {teamGroup.name}
                                    </td>
                                    <td
                                        className={`${styles.Cell} ${styles.Filter}`}
                                    >
                                        {teamGroup.filter}
                                    </td>
                                    <td
                                        className={`${styles.Cell} ${styles.CreatedAt}`}
                                    >
                                        {moment(teamGroup.createdAt).fromNow()}
                                    </td>
                                    <td
                                        className={`${styles.Cell} ${styles.Actions}`}
                                    >
                                        <div
                                            className={`${styles.RowAction} ${styles.Edit}`}
                                        >
                                            <MaterialIconUI
                                                iconStyle={'outlined'}
                                            >
                                                edit
                                            </MaterialIconUI>
                                        </div>
                                        <div
                                            className={`${styles.RowAction} ${styles.Delete}`}
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

    private renderRolloutsTab(): ReactNode {
        return (
            <div className={styles.RolloutsTab}>
                <div className={styles.RolloutListSection}>
                    <div className={styles.Tabs}>
                        {rolloutGroupTabs.map((tab) => (
                            <div
                                className={`${styles.Tab} ${classNames({
                                    [styles.Active]:
                                        this.state.showRolloutGroupTabViews[
                                            tab.key
                                        ],
                                })}`}
                                onClick={this.onRolloutGroupTabClickHandler(
                                    tab,
                                )}
                            >
                                {tab.name}
                            </div>
                        ))}
                    </div>
                    <div className={styles.RolloutList}>
                        {this.renderRolloutTabs()}
                    </div>
                </div>
                <div className={styles.RolloutDetailSection}>
                    {this.renderRolloutDetail()}
                </div>
            </div>
        );
    }

    private renderRolloutTabs() {
        if (this.state.showRolloutGroupTabViews['users']) {
            return userGroupRollouts.map((rollout: Rollout<UserGroup>) =>
                this.renderRolloutTab(
                    rollout,
                    this.onUserRolloutTabClickHandler,
                    this.state.selectedUserGroupRollout,
                ),
            );
        } else if (this.state.showRolloutGroupTabViews['teams']) {
            return teamGroupRollouts.map((rollout: Rollout<TeamGroup>) =>
                this.renderRolloutTab(
                    rollout,
                    this.onTeamRolloutTabClickHandler,
                    this.state.selectedTeamGroupRollout,
                ),
            );
        }
    }

    private renderRolloutDetail(): ReactNode {
        if (this.state.showRolloutGroupTabViews['users']) {
            return this.renderUserGroupRollout();
        } else if (this.state.showRolloutGroupTabViews['teams']) {
            return this.renderTeamGroupRollout();
        }
    }

    private renderUserGroupRollout(): ReactNode {
        return (
            this.state.selectedUserGroupRollout && (
                <div className={styles.Box}>
                    <div className={styles.RolloutInfo}>
                        {this.renderRolloutInfo(
                            this.state.selectedUserGroupRollout,
                        )}
                    </div>
                    <div className={styles.Groups}>
                        <div className={`${styles.Label} ${styles.NextRow}`}>
                            User Groups:
                        </div>
                        <div className={styles.GroupList}>
                            {this.state.selectedUserGroupRollout.groups.map(
                                (group) => (
                                    <div className={styles.Group}>
                                        <div className={styles.TopRow}>
                                            <div
                                                className={`${styles.Attribute}`}
                                            >
                                                {group.id}
                                            </div>
                                        </div>
                                        <div className={styles.Name}>
                                            {group.name}
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            )
        );
    }

    private renderTeamGroupRollout(): ReactNode {
        return (
            this.state.selectedTeamGroupRollout && (
                <div className={styles.Box}>
                    <div className={styles.RolloutInfo}>
                        {this.renderRolloutInfo(
                            this.state.selectedTeamGroupRollout,
                        )}
                    </div>

                    <div className={styles.Groups}>
                        <div className={`${styles.Label} ${styles.NextRow}`}>
                            User Groups:
                        </div>
                        <div className={styles.GroupList}>
                            {this.state.selectedTeamGroupRollout.groups.map(
                                (group) => (
                                    <div className={styles.Group}>
                                        <div className={styles.TopRow}>
                                            <div
                                                className={`${styles.Attribute}`}
                                            >
                                                {group.id}
                                            </div>
                                        </div>
                                        <div className={styles.Name}>
                                            {group.name}
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            )
        );
    }

    private renderRolloutInfo<Group>(rollout: Rollout<Group>): ReactNode {
        switch (rollout.type) {
            case 'static':
                return this.renderStaticRolloutInfo(rollout);
            case 'timeRange':
                return this.renderTimeRangeRolloutInfo(rollout);
            case 'experiment':
                return this.renderExperimentRolloutInfo(rollout);
        }
    }

    private renderStaticRolloutInfo<Group>(
        rollout: StaticRollout<Group>,
    ): ReactNode {
        return (
            <>
                <div className={`${styles.Row} ${styles.Id}`}>
                    <span className={`${styles.Label} ${styles.SameRow}`}>
                        ID:
                    </span>
                    {rollout.id}
                </div>
                <div className={`${styles.Row} ${styles.Type}`}>
                    <span className={`${styles.Label} ${styles.SameRow}`}>
                        Type:
                    </span>
                    {rollout.type}
                </div>
                <div className={`${styles.Row} ${styles.Version}`}>
                    <span className={`${styles.Label} ${styles.SameRow}`}>
                        App version:
                    </span>
                    <span className={styles.Value}>
                        {rollout.version.number}
                    </span>
                </div>
                <div className={`${styles.Row} ${styles.CreatedAt}`}>
                    <span className={`${styles.Label} ${styles.SameRow}`}>
                        Created at:
                    </span>
                    {moment(rollout.createdAt).fromNow()}
                </div>
            </>
        );
    }

    private renderTimeRangeRolloutInfo<Group>(
        rollout: TimeRangeRollout<Group>,
    ): ReactNode {
        return (
            <>
                <div className={`${styles.Row} ${styles.Id}`}>
                    <span className={`${styles.Label} ${styles.SameRow}`}>
                        ID:
                    </span>
                    {rollout.id}
                </div>
                <div className={`${styles.Row} ${styles.Type}`}>
                    <span className={`${styles.Label} ${styles.SameRow}`}>
                        Type:
                    </span>
                    {rollout.type}
                </div>
                <div className={`${styles.Row} ${styles.Version}`}>
                    <span className={`${styles.Label} ${styles.SameRow}`}>
                        App version:
                    </span>
                    <span className={styles.Value}>
                        {rollout.version.number}
                    </span>
                </div>
                <div className={`${styles.Row} ${styles.StartAt}`}>
                    <span className={`${styles.Label} ${styles.SameRow}`}>
                        Start at:
                    </span>
                    <span className={styles.Value}>
                        {rollout.startAt &&
                            moment(rollout.startAt).format('l LT')}
                    </span>
                </div>
                <div className={`${styles.Row} ${styles.EndAt}`}>
                    <span className={`${styles.Label} ${styles.SameRow}`}>
                        End at:
                    </span>
                    <span className={styles.Value}>
                        {rollout.endAt && moment(rollout.endAt).format('l LT')}
                    </span>
                </div>
                <div className={`${styles.Row} ${styles.CreatedAt}`}>
                    <span className={`${styles.Label} ${styles.SameRow}`}>
                        Created at:
                    </span>
                    {moment(rollout.createdAt).fromNow()}
                </div>
            </>
        );
    }

    private renderExperimentRolloutInfo<Group>(
        rollout: ExperimentRollout<Group>,
    ): ReactNode {
        return (
            <>
                <div className={`${styles.Row} ${styles.Id}`}>
                    <span className={`${styles.Label} ${styles.SameRow}`}>
                        ID:
                    </span>
                    {rollout.id}
                </div>
                <div className={`${styles.Row} ${styles.Type}`}>
                    <span className={`${styles.Label} ${styles.SameRow}`}>
                        Type:
                    </span>
                    {rollout.type}
                </div>
                <div className={`${styles.Row} ${styles.Versions}`}>
                    <span className={`${styles.Label} ${styles.SameRow}`}>
                        App versions:
                    </span>
                    <span className={styles.Values}>
                        {rollout.versions.map((version) => (
                            <span className={styles.Value}>
                                {version.number}
                            </span>
                        ))}
                    </span>
                </div>
                <div className={`${styles.Row} ${styles.StartAt}`}>
                    <span className={`${styles.Label} ${styles.SameRow}`}>
                        Start at:
                    </span>
                    <span className={styles.Value}>
                        {rollout.startAt &&
                            moment(rollout.startAt).format('l LT')}
                    </span>
                </div>
                <div className={`${styles.Row} ${styles.EndAt}`}>
                    <span className={`${styles.Label} ${styles.SameRow}`}>
                        End at:
                    </span>
                    <span className={styles.Value}>
                        {rollout.endAt && moment(rollout.endAt).format('l LT')}
                    </span>
                </div>
                <div className={`${styles.Row} ${styles.CreatedAt}`}>
                    <span className={`${styles.Label} ${styles.SameRow}`}>
                        Created at:
                    </span>
                    {moment(rollout.createdAt).fromNow()}
                </div>
            </>
        );
    }

    private renderRolloutTab<Group>(
        rollout: Rollout<Group>,
        onRolloutTabClickHandler: (rollout: Rollout<Group>) => () => void,
        selectedRollout?: Rollout<Group>,
    ) {
        return (
            <div
                className={`${styles.Rollout} ${classNames({
                    [styles.Active]: selectedRollout?.id == rollout.id,
                })}`}
                onClick={onRolloutTabClickHandler(rollout)}
            >
                <div className={styles.TopRow}>
                    <div className={`${styles.Attribute} ${styles.Id}`}>
                        {rollout.id}
                    </div>
                    <div className={`${styles.Attribute} ${styles.Type}`}>
                        {rollout.type}
                    </div>
                </div>
                <div className={styles.Name}>{rollout.name}</div>
                <div className={styles.CreatedAt}>
                    {moment(rollout.createdAt).fromNow()}
                </div>
            </div>
        );
    }

    private onRolloutGroupTabClickHandler = (tab: Tab<RolloutGroupTabKey>) => {
        return () => {
            this.setState({
                showRolloutGroupTabViews: Object.assign(
                    {
                        users: false,
                        teams: false,
                    },
                    {
                        [tab.key]: true,
                    },
                ),
            });
        };
    };

    private onUserRolloutTabClickHandler = (rollout: Rollout<UserGroup>) => {
        return () => {
            this.setState({
                selectedUserGroupRollout: rollout,
            });
        };
    };

    private onTeamRolloutTabClickHandler = (rollout: Rollout<TeamGroup>) => {
        return () => {
            this.setState({
                selectedTeamGroupRollout: rollout,
            });
        };
    };
}
