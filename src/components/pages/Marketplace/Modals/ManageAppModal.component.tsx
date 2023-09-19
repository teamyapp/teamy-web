import classNames from 'classnames';
import moment from 'moment';
import React, { Component, ReactNode, createRef } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';

import { Deps } from '@core/dep/deps';
import { AppSecret } from '@core/entity/appSecret';
import { AppVersion } from '@core/entity/appVersion';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import { getUserShortName } from '../../../internal/format';
import github2IconImg from '../assets/github2.png';
import githubIconImg from '../assets/github.png';
import { CreateAppSecretModalComponent } from './CreateAppSecretModal.component';
import { CreateTeamGroupModalComponent } from './CreateTeamGroupModal.component';
import { CreateUserGroupModalComponent } from './CreateUserGroupModal.component';
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

type GroupTabKey = 'users' | 'teams';

const groupTabs: Tab<GroupTabKey>[] = [
    {
        name: 'Users',
        key: 'users',
    },
    {
        name: 'Teams',
        key: 'teams',
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

const appSecrets: AppSecret[] = [
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
        app: {
            id: 1,
            secrets: [],
            totalInstallations: 0,
            versions: [],
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
        app: {
            id: 1,
            secrets: [],
            totalInstallations: 0,
            versions: [],
        },
    },
];

const appVersions: AppVersion[] = [
    {
        number: 1,
        appName: 'GH',
        description: 'Github integration',
        iconUrl: github2IconImg,
        changes: ['Create initial version of app'],
        createdAt: moment().subtract('2', 'd').toDate(),
        createdBy: {
            id: 1,
            firstName: 'Harry',
            lastName: 'Liu',
            fullName: 'Harry Liu',
            profileUrl: '',
            teams: [],
            linkedUsers: [],
        },
        prices: [],
        isReady: true,
    },
    {
        number: 2,
        appName: 'Github',
        description: 'Github integration for Teamy',
        iconUrl: githubIconImg,
        changes: ['Use a new icon for the app', 'Clarified app description'],
        createdAt: moment().subtract('1', 'd').toDate(),
        createdBy: {
            id: 1,
            firstName: 'Harry',
            lastName: 'Liu',
            fullName: 'Harry Liu',
            profileUrl: '',
            teams: [],
            linkedUsers: [],
        },
        prices: [],
        isReady: true,
    },
    {
        number: 3,
        appName: 'Github',
        description: 'Github integration for Teamy',
        iconUrl: githubIconImg,
        changes: ['Support pull request automation'],
        createdAt: moment().subtract('1', 'd').toDate(),
        createdBy: {
            id: 1,
            firstName: 'Harry',
            lastName: 'Liu',
            fullName: 'Harry Liu',
            profileUrl: '',
            teams: [],
            linkedUsers: [],
        },
        prices: [],
        isReady: true,
    },
    {
        number: 4,
        appName: '',
        description: '',
        iconUrl: '',
        changes: [],
        createdAt: moment().subtract('1', 'd').toDate(),
        createdBy: {
            id: 1,
            firstName: 'Harry',
            lastName: 'Liu',
            fullName: 'Harry Liu',
            profileUrl: '',
            teams: [],
            linkedUsers: [],
        },
        prices: [],
        isReady: false,
    },
];

interface UserGroup {
    id: number;
    name: string;
    filter: string;
    createdAt: Date;
    rollouts: Rollout<UserGroup>[];
}

const userGroups: UserGroup[] = [
    {
        id: 1,
        name: 'US Software Engineer',
        filter: '(country=US) or (jobTitle=software engineer)',
        createdAt: new Date(),
        rollouts: [],
    },
    {
        id: 2,
        name: 'US Teenager',
        filter: '(country=US) and (age>18) and (age<26)',
        createdAt: new Date(),
        rollouts: [],
    },
];

interface TeamGroup {
    id: number;
    name: string;
    filter: string;
    createdAt: Date;
    rollouts: Rollout<TeamGroup>[];
}

const teamGroups: TeamGroup[] = [
    {
        id: 1,
        name: 'US Technology',
        filter: '(country=US) AND ((industry=software) or (industry=hardware))',
        createdAt: new Date(),
        rollouts: [],
    },
    {
        id: 2,
        name: 'US Massachusetts',
        filter: '(country=US) AND (state=MA)',
        createdAt: new Date(),
        rollouts: [],
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

userGroups[0].rollouts.push(userGroupRollouts[0], userGroupRollouts[2]);
userGroups[1].rollouts.push(userGroupRollouts[1], userGroupRollouts[2]);
teamGroups[0].rollouts.push(teamGroupRollouts[0]);
teamGroups[1].rollouts.push(teamGroupRollouts[0]);

type AppPackageStatus = 'selecting' | 'uploading' | 'processing' | 'ready';

interface Props {
    deps: Deps;
}

interface State {
    app?: App;
    selectedAppVersion?: AppVersion;
    selectedUserGroup?: UserGroup;
    selectedTeamGroup?: TeamGroup;
    selectedUserGroupRollout?: Rollout<UserGroup>;
    selectedTeamGroupRollout?: Rollout<TeamGroup>;
    showTabViews: Record<TabKey, boolean>;
    showGroupTabViews: Record<GroupTabKey, boolean>;
    showRolloutGroupTabViews: Record<RolloutGroupTabKey, boolean>;
    appPackageStatus: AppPackageStatus;
}

export class ManageAppModalComponent extends Component<Props, State> {
    private readonly modalRef = createRef<ModalUI>();
    private readonly createAppSecretModalRef =
        createRef<CreateAppSecretModalComponent>();
    private readonly createUserGroupModalRef =
        createRef<CreateUserGroupModalComponent>();
    private readonly createTeamGroupModalRef =
        createRef<CreateTeamGroupModalComponent>();
    private readonly stateSyncer: StateSyncer;

    constructor(props: Props) {
        super(props);
        this.stateSyncer = props.deps.stateSyncer;
        this.state = {
            showTabViews: {
                credentials: true,
                versions: false,
                groups: false,
                rollouts: false,
            },
            showGroupTabViews: {
                users: true,
                teams: false,
            },
            showRolloutGroupTabViews: {
                users: true,
                teams: false,
            },
            appPackageStatus: 'processing',
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
                        <CreateAppSecretModalComponent
                            deps={this.props.deps}
                            ref={this.createAppSecretModalRef}
                            appId={this.state.app.id}
                        />
                        <CreateUserGroupModalComponent
                            deps={this.props.deps}
                            ref={this.createUserGroupModalRef}
                            appId={this.state.app.id}
                        />
                        <CreateTeamGroupModalComponent
                            deps={this.props.deps}
                            ref={this.createTeamGroupModalRef}
                            appId={this.state.app.id}
                        />
                    </>
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
                        <div className={styles.Title}>API Secrets</div>
                        <div className={styles.Spacer} />
                        <div className={styles.Actions}>
                            <div
                                className={`${styles.Action} ${styles.CreateSecret}`}
                                onClick={this.onCreateSecretClick}
                            >
                                Create secret
                            </div>
                        </div>
                    </div>
                    <table className={`${styles.Table} ${styles.Secret}`}>
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
                            {appSecrets.map((secret) => (
                                <tr className={styles.SecretRow}>
                                    <td
                                        className={`${styles.Cell} ${styles.Name}`}
                                    >
                                        {secret.name}
                                    </td>
                                    <td>{moment(secret.addedAt).fromNow()}</td>
                                    <td>
                                        {getUserShortName(
                                            secret.addedBy.firstName,
                                            secret.addedBy.lastName,
                                        )}
                                    </td>
                                    <td>
                                        {secret.lastUsedAt
                                            ? moment(
                                                  secret.lastUsedAt,
                                              ).fromNow()
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
                    <div
                        className={`${styles.Action} ${styles.CreateVersion}`}
                        onClick={this.onCreateVersionClick}
                    >
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
                    {this.state.selectedAppVersion &&
                        (this.state.selectedAppVersion.isReady
                            ? this.renderAppVersionDetail()
                            : this.renderUploadAppVersionPackage())}
                </div>
            </div>
        );
    }

    private renderUploadAppVersionPackage(): ReactNode {
        return (
            <div className={`${styles.Box} ${styles.UploadAppPackage}`}>
                {this.renderUploadAppPackageTabContent()}
            </div>
        );
    }

    private renderUploadAppPackageTabContent(): ReactNode {
        switch (this.state.appPackageStatus) {
            case 'selecting':
                return this.renderSelectingAppPackageTab();
            case 'uploading':
                return this.renderUploadingAppPackageTab();
            case 'processing':
                return this.renderProcessingAppPackageTab();
        }
    }

    private renderSelectingAppPackageTab(): ReactNode {
        return (
            <>
                <div className={styles.Title}>Select App Package</div>
                <div className={`${styles.Button} ${styles.SelectFile}`}>
                    <div className={styles.Icon}>
                        <MaterialIconUI>upload_file</MaterialIconUI>
                    </div>
                    <input type={'file'} className={styles.FileInput} />
                </div>
            </>
        );
    }

    private renderUploadingAppPackageTab(): ReactNode {
        return (
            <>
                <div className={styles.Title}>Uploading App Package</div>
                <div className={styles.ProgressBar}>
                    <div className={styles.Progress} />
                </div>
            </>
        );
    }

    private renderProcessingAppPackageTab(): ReactNode {
        return (
            <>
                <div className={styles.Title}>Processing App Package</div>
                <div className={styles.Spinner}>
                    <div className={`${styles.Rect} ${styles.One}`} />
                    <div className={`${styles.Rect} ${styles.Two}`} />
                    <div className={`${styles.Rect} ${styles.Three}`} />
                    <div className={`${styles.Rect} ${styles.Four}`} />
                    <div className={`${styles.Rect} ${styles.Five}`} />
                </div>
            </>
        );
    }

    private renderAppPackageReadyTab(): ReactNode {
        return <></>;
    }

    private renderAppVersionDetail() {
        return (
            this.state.selectedAppVersion && (
                <div className={`${styles.Box} ${styles.VersionDetail}`}>
                    <div className={`${styles.Row} ${styles.Icon}`}>
                        <img
                            className={styles.Icon}
                            src={this.state.selectedAppVersion.iconUrl}
                        />
                    </div>
                    <div className={`${styles.Row} ${styles.Name}`}>
                        <span className={`${styles.Label} ${styles.SameRow}`}>
                            Name:
                        </span>
                        {this.state.selectedAppVersion.appName}
                    </div>
                    <div className={`${styles.Row} ${styles.Description}`}>
                        <span className={`${styles.Label} ${styles.SameRow}`}>
                            Description:
                        </span>
                        {this.state.selectedAppVersion.description}
                    </div>
                    <div className={`${styles.Row} ${styles.Changes}`}>
                        <div className={`${styles.Label} ${styles.NextRow}`}>
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
                    <div className={`${styles.Row} ${styles.CreatedAt}`}>
                        <span className={`${styles.Label} ${styles.SameRow}`}>
                            Created at:
                        </span>
                        {moment(this.state.selectedAppVersion.createdAt).format(
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
            )
        );
    }

    private renderGroupsTab(): ReactNode {
        return (
            <div className={styles.GroupsTab}>
                <div className={styles.GroupListSection}>
                    <div className={styles.Tabs}>
                        {groupTabs.map((tab) => (
                            <div
                                className={`${styles.Tab} ${classNames({
                                    [styles.Active]:
                                        this.state.showGroupTabViews[tab.key],
                                })}`}
                                onClick={this.onGroupTabClickHandler(tab)}
                            >
                                {tab.name}
                            </div>
                        ))}
                    </div>
                    {this.renderGroupsSection()}
                </div>
                <div className={styles.GroupDetailSection}>
                    {this.renderGroupDetail()}
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
                    <div className={`${styles.Action} ${styles.CreateRollout}`}>
                        Create Rollout
                    </div>
                    <div className={styles.RolloutList}>
                        {this.renderRollouts()}
                    </div>
                </div>
                <div className={styles.RolloutDetailSection}>
                    {this.renderRolloutDetail()}
                </div>
            </div>
        );
    }

    private renderGroupsSection(): ReactNode {
        if (this.state.showGroupTabViews['users']) {
            return (
                <>
                    <div
                        className={`${styles.Action} ${styles.CreateGroup}`}
                        onClick={this.onCreateUserGroupClick}
                    >
                        Create Group
                    </div>
                    <div className={styles.GroupList}>
                        {userGroups.map((userGroup) =>
                            this.renderInlineGroup(
                                userGroup,
                                this.onInlineUserGroupClickHandler,
                                this.state.selectedUserGroup,
                            ),
                        )}
                    </div>
                </>
            );
        } else if (this.state.showGroupTabViews['teams']) {
            return (
                <>
                    <div
                        className={`${styles.Action} ${styles.CreateGroup}`}
                        onClick={this.onCreateTeamGroupClick}
                    >
                        Create Group
                    </div>
                    <div className={styles.GroupList}>
                        {teamGroups.map((teamGroup) =>
                            this.renderInlineGroup(
                                teamGroup,
                                this.onInlineTeamGroupClickHandler,
                                this.state.selectedTeamGroup,
                            ),
                        )}
                    </div>
                </>
            );
        }
    }

    private renderInlineGroup<Group extends UserGroup | TeamGroup>(
        group: Group,
        onInlineGroupClickHandler: (group: Group) => () => void,
        selectedGroup?: Group,
    ) {
        return (
            <div
                className={`${styles.Group} ${classNames({
                    [styles.Active]: selectedGroup?.id == group.id,
                })}`}
                onClick={onInlineGroupClickHandler(group)}
            >
                <div className={styles.TopRow}>
                    <div className={`${styles.Attribute} ${styles.Id}`}>
                        {group.id}
                    </div>
                </div>
                <div className={styles.Name}>{group.name}</div>
                <div className={styles.CreatedAt}>
                    {moment(group.createdAt).fromNow()}
                </div>
            </div>
        );
    }

    private renderGroupDetail(): ReactNode {
        if (this.state.showGroupTabViews['users']) {
            return this.renderGroup(this.state.selectedUserGroup);
        } else if (this.state.showGroupTabViews['teams']) {
            return this.renderGroup(this.state.selectedTeamGroup);
        }
    }

    private renderGroup(selectedGroup?: UserGroup | TeamGroup): ReactNode {
        return (
            selectedGroup && (
                <div className={`${styles.Box} ${styles.Group}`}>
                    <div className={styles.GroupInfo}>
                        <div className={`${styles.Row} ${styles.Id}`}>
                            <span
                                className={`${styles.Label} ${styles.SameRow}`}
                            >
                                ID:
                            </span>
                            {selectedGroup.id}
                        </div>
                        <div className={`${styles.Row} ${styles.Type}`}>
                            <span
                                className={`${styles.Label} ${styles.SameRow}`}
                            >
                                Name:
                            </span>
                            {selectedGroup.name}
                        </div>
                        <div className={`${styles.Row} ${styles.Filter}`}>
                            <div
                                className={`${styles.Label} ${styles.NextRow}`}
                            >
                                Filter:
                            </div>
                            <div>{selectedGroup.filter}</div>
                        </div>
                        <div className={`${styles.Row} ${styles.CreatedAt}`}>
                            <span
                                className={`${styles.Label} ${styles.SameRow}`}
                            >
                                Created at:
                            </span>
                            {moment(selectedGroup.createdAt).fromNow()}
                        </div>
                    </div>
                    <div className={styles.Rollouts}>
                        <div className={`${styles.Label} ${styles.NextRow}`}>
                            Rollouts:
                        </div>
                        <div className={styles.RolloutList}>
                            {selectedGroup.rollouts.map((rollout) => (
                                <div className={styles.Rollout}>
                                    <div className={styles.TopRow}>
                                        <div className={`${styles.Attribute}`}>
                                            {rollout.id}
                                        </div>
                                        <div className={`${styles.Attribute}`}>
                                            {rollout.type}
                                        </div>
                                    </div>
                                    <div className={styles.Name}>
                                        {rollout.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.Buttons}>
                        <div className={styles.Delete}>
                            <ButtonUI label={'Delete'} />
                        </div>
                    </div>
                </div>
            )
        );
    }

    private renderRollouts() {
        if (this.state.showRolloutGroupTabViews['users']) {
            return userGroupRollouts.map((rollout: Rollout<UserGroup>) =>
                this.renderInlineRollout(
                    rollout,
                    this.onInlineUserRolloutClickHandler,
                    this.state.selectedUserGroupRollout,
                ),
            );
        } else if (this.state.showRolloutGroupTabViews['teams']) {
            return teamGroupRollouts.map((rollout: Rollout<TeamGroup>) =>
                this.renderInlineRollout(
                    rollout,
                    this.onInlineTeamRolloutClickHandler,
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
                <div className={`${styles.Box} ${styles.Group}`}>
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
                    <div className={styles.Buttons}>
                        <div className={styles.Delete}>
                            <ButtonUI label={'Delete'} />
                        </div>
                    </div>
                </div>
            )
        );
    }

    private renderTeamGroupRollout(): ReactNode {
        return (
            this.state.selectedTeamGroupRollout && (
                <div className={`${styles.Box} ${styles.Group}`}>
                    <div className={styles.RolloutInfo}>
                        {this.renderRolloutInfo(
                            this.state.selectedTeamGroupRollout,
                        )}
                    </div>

                    <div className={styles.Groups}>
                        <div className={`${styles.Label} ${styles.NextRow}`}>
                            Team Groups:
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
                    <div className={styles.Buttons}>
                        <div className={styles.Delete}>
                            <ButtonUI label={'Delete'} />
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

    private renderInlineRollout<Group>(
        rollout: Rollout<Group>,
        onInlineRolloutClickHandler: (rollout: Rollout<Group>) => () => void,
        selectedRollout?: Rollout<Group>,
    ) {
        return (
            <div
                className={`${styles.Rollout} ${classNames({
                    [styles.Active]: selectedRollout?.id == rollout.id,
                })}`}
                onClick={onInlineRolloutClickHandler(rollout)}
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

    private onCreateSecretClick = () => {
        this.createAppSecretModalRef.current?.open();
    };

    private onGroupTabClickHandler = (tab: Tab<GroupTabKey>) => {
        return () => {
            this.setState({
                showGroupTabViews: Object.assign(
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

    private onInlineUserGroupClickHandler = (group: UserGroup) => {
        return () => {
            this.setState({
                selectedUserGroup: group,
            });
        };
    };

    private onInlineTeamGroupClickHandler = (group: TeamGroup) => {
        return () => {
            this.setState({
                selectedTeamGroup: group,
            });
        };
    };

    private onInlineUserRolloutClickHandler = (rollout: Rollout<UserGroup>) => {
        return () => {
            this.setState({
                selectedUserGroupRollout: rollout,
            });
        };
    };

    private onInlineTeamRolloutClickHandler = (rollout: Rollout<TeamGroup>) => {
        return () => {
            this.setState({
                selectedTeamGroupRollout: rollout,
            });
        };
    };

    private onCreateVersionClick = async () => {
        if (this.state.app) {
            let versionNumber = await this.stateSyncer.createAppVersion(
                this.state.app.id,
            );
            // TODO: show newly created version
        }
    };

    private onCreateUserGroupClick = () => {
        this.createUserGroupModalRef.current?.open();
    };

    private onCreateTeamGroupClick = () => {
        this.createTeamGroupModalRef.current?.open();
    };
}
