import classNames from 'classnames';
import moment from 'moment';
import React, { ChangeEvent, Component, ReactNode, createRef } from 'react';

import { PubSub } from '@lib/pubSub/pubSub';
import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';

import { Deps } from '@core/dep/deps';
import { AppSecret } from '@core/entity/appSecret';
import { AppVersion } from '@core/entity/appVersion';
import { Feedback } from '@core/entity/feedback';
import { Group } from '@core/entity/group';
import { Rollout } from '@core/entity/rollout';
import { Team } from '@core/entity/team';
import { User } from '@core/entity/user';
import { GraphSource } from '@core/storage/graph/graphSource';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import { UserProfileUI } from '../../../internal/UserProfile';
import { getUserShortName } from '../../../internal/format';
import github2IconImg from '../assets/github2.png';
import githubIconImg from '../assets/github.png';
import { CreateAppSecretModalComponent } from './CreateAppSecretModal.component';
import { CreateTeamGroupModalComponent } from './CreateTeamGroupModal.component';
import { CreateTeamRolloutModalComponent } from './CreateTeamRolloutModal.component';
import { CreateUserGroupModalComponent } from './CreateUserGroupModal.component';
import { CreateUserRolloutModalComponent } from './CreateUserRolloutModal.component';
import { EditGroupViewComponent } from './EditGroupView.component';
import {
    EditRolloutViewComponent,
    EditRolloutViewComponentHandle,
} from './EditRolloutView.component';
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
        id: 2,
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

const userGroups: Group<User>[] = [
    {
        id: 1,
        type: 'static',
        name: 'Beta testers',
        members: [
            {
                id: 1,
                firstName: 'Harry',
                lastName: 'Liu',
                fullName: 'Harry Liu',
                profileUrl:
                    'https://cloud.staging.teamyapp.com/file/files/23133',
                teams: [],
                linkedUsers: [],
            },
            {
                id: 2,
                firstName: 'Xianbo',
                lastName: 'Duan',
                fullName: 'Xianbo Duan',
                profileUrl:
                    'https://cloud.staging.teamyapp.com/file/files/21532',
                teams: [],
                linkedUsers: [],
            },
        ],
        createdAt: new Date(),
        rollouts: [],
    },
    {
        id: 2,
        type: 'filter',
        name: 'US Teenager',
        filter: '(country=US) and (age>18) and (age<26)',
        createdAt: new Date(),
        rollouts: [],
    },
];

const teamGroups: Group<Team>[] = [
    {
        id: 1,
        type: 'static',
        name: '1st party partners',
        members: [
            {
                id: 1,
                name: 'Teamy',
                iconUrl: 'https://cloud.staging.teamyapp.com/file/files/3469',
                creator: {
                    id: 1,
                    firstName: 'Harry',
                    lastName: 'Liu',
                    fullName: 'Harry Liu',
                    profileUrl:
                        'https://cloud.staging.teamyapp.com/file/files/23133',
                    teams: [],
                    linkedUsers: [],
                },
                owner: {
                    id: 1,
                    firstName: 'Harry',
                    lastName: 'Liu',
                    fullName: 'Harry Liu',
                    profileUrl:
                        'https://cloud.staging.teamyapp.com/file/files/23133',
                    teams: [],
                    linkedUsers: [],
                },
            },
            {
                id: 2,
                name: 'Test',
                iconUrl: '',
                creator: {
                    id: 1,
                    firstName: 'Harry',
                    lastName: 'Liu',
                    fullName: 'Harry Liu',
                    profileUrl:
                        'https://cloud.staging.teamyapp.com/file/files/23133',
                    teams: [],
                    linkedUsers: [],
                },
                owner: {
                    id: 1,
                    firstName: 'Harry',
                    lastName: 'Liu',
                    fullName: 'Harry Liu',
                    profileUrl:
                        'https://cloud.staging.teamyapp.com/file/files/23133',
                    teams: [],
                    linkedUsers: [],
                },
            },
        ],
        createdAt: new Date(),
        rollouts: [],
    },
    {
        id: 2,
        type: 'filter',
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

const userGroupRollouts: Rollout<User>[] = [
    {
        id: 1,
        name: 'Initial beta',
        activator: {
            id: 1,
            type: 'static',
            createdAt: new Date(),
        },
        versionSelector: {
            id: 1,
            type: 'static',
            versionNumber: 1,
            createdAt: new Date(),
        },
        isEnabled: true,
        createdAt: new Date(),
        groups: [userGroups[0]],
    },
    {
        id: 2,
        name: 'Black Friday deals',
        activator: {
            id: 2,
            type: 'timeRange',
            startAt: moment().subtract(1, 'd').toDate(),
            endAt: moment().add(1, 'd').toDate(),
            createdAt: new Date(),
        },
        versionSelector: {
            id: 2,
            type: 'static',
            versionNumber: 2,
            createdAt: new Date(),
        },
        isEnabled: true,
        createdAt: new Date(),
        groups: [userGroups[1]],
    },
    {
        id: 3,
        name: 'Banner Testing',
        activator: {
            id: 3,
            type: 'percentage',
            percentage: 70,
            createdAt: new Date(),
        },
        versionSelector: {
            id: 3,
            type: 'experiment',
            versionNumbers: [1, 2, 3, 4],
            createdAt: new Date(),
        },
        isEnabled: true,
        createdAt: new Date(),
        groups: [userGroups[0], userGroups[1]],
    },
];

const teamGroupRollouts: Rollout<Team>[] = [
    {
        id: 4,
        name: 'Banner Testing',
        activator: {
            id: 4,
            type: 'timeRange',
            startAt: moment().subtract(1, 'd').toDate(),
            endAt: moment().add(1, 'd').toDate(),
            createdAt: new Date(),
        },
        versionSelector: {
            id: 4,
            type: 'experiment',
            versionNumbers: [1, 2, 3, 4],
            createdAt: new Date(),
        },
        isEnabled: true,
        createdAt: new Date(),
        groups: [teamGroups[0], teamGroups[1]],
    },
];

userGroups[0].rollouts.push(userGroupRollouts[0], userGroupRollouts[2]);
userGroups[1].rollouts.push(userGroupRollouts[1], userGroupRollouts[2]);
teamGroups[0].rollouts.push(teamGroupRollouts[0]);
teamGroups[1].rollouts.push(teamGroupRollouts[0]);

type AppPackageStatus = 'selecting' | 'uploading' | 'processing' | 'ready';

const EditUserGroupRolloutViewComponent = EditRolloutViewComponent<User>();
const EditTeamGroupRolloutViewComponent = EditRolloutViewComponent<Team>();

interface ApiSecretInput {
    name: string;
}

interface Props {
    deps: Deps;
}

interface State {
    app?: App;
    selectedAppVersion?: AppVersion;
    selectedUserGroup?: Group<User>;
    selectedTeamGroup?: Group<Team>;
    selectedUserGroupRollout?: Rollout<User>;
    selectedTeamGroupRollout?: Rollout<Team>;
    showTabViews: Record<TabKey, boolean>;
    showGroupTabViews: Record<GroupTabKey, boolean>;
    showRolloutGroupTabViews: Record<RolloutGroupTabKey, boolean>;
    appPackageStatus: AppPackageStatus;
    apiSecretInputs: Record<number, ApiSecretInput>;
}

export class ManageAppModalComponent extends Component<Props, State> {
    private readonly editGroupViewRef =
        createRef<EditGroupViewComponent<User | Team>>();
    private readonly modalRef = createRef<ModalUI>();
    private readonly createAppSecretModalRef =
        createRef<CreateAppSecretModalComponent>();
    private readonly createUserGroupModalRef =
        createRef<CreateUserGroupModalComponent>();
    private readonly createTeamGroupModalRef =
        createRef<CreateTeamGroupModalComponent>();
    private readonly createUserRolloutModalRef =
        createRef<CreateUserRolloutModalComponent>();
    private readonly createTeamRolloutModalRef =
        createRef<CreateTeamRolloutModalComponent>();
    private readonly editUserGroupRolloutViewRef =
        createRef<EditRolloutViewComponentHandle<User>>();
    private readonly editTeamGroupRolloutViewRef =
        createRef<EditRolloutViewComponentHandle<Team>>();
    private readonly graphSource: GraphSource;
    private readonly stateSyncer: StateSyncer;
    private readonly feedbackPubSub: PubSub<Feedback>;

    constructor(props: Props) {
        super(props);
        this.graphSource = props.deps.graphSource;
        this.stateSyncer = props.deps.stateSyncer;
        this.feedbackPubSub = props.deps.feedbackPubSub;
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
            apiSecretInputs: {},
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
                        <CreateUserRolloutModalComponent
                            ref={this.createUserRolloutModalRef}
                        />
                        <CreateTeamRolloutModalComponent
                            ref={this.createTeamRolloutModalRef}
                        />
                    </>
                </ModalUI>
            )
        );
    }

    open(appId: number) {
        const app = apps[appId];
        const apiSecretInputs: Record<number, ApiSecretInput> = {};
        appSecrets.forEach((secret) => {
            if (secret.app.id == appId) {
                apiSecretInputs[secret.id] = {
                    name: secret.name,
                };
            }
        });
        this.setState(
            {
                app: app,
                apiSecretInputs: apiSecretInputs,
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
                                <th className={`${styles.Cell} ${styles.Id}`}>
                                    ID
                                </th>
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
                                <tr
                                    key={secret.id}
                                    className={styles.SecretRow}
                                >
                                    <td>{secret.id}</td>
                                    <td
                                        className={`${styles.Cell} ${styles.Name}`}
                                    >
                                        <input
                                            type={'text'}
                                            className={styles.TextField}
                                            value={
                                                this.state.apiSecretInputs[
                                                    secret.id
                                                ].name
                                            }
                                            onChange={this.onApiSecretNameChangeHandler(
                                                secret.id,
                                            )}
                                        />
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
                                            className={`${styles.RowAction} ${styles.Copy}`}
                                            onClick={this.onCopySecretClickHandler(
                                                secret.id,
                                            )}
                                        >
                                            <MaterialIconUI
                                                iconStyle={'outlined'}
                                            >
                                                content_copy
                                            </MaterialIconUI>
                                        </div>
                                        <div
                                            className={`${styles.RowAction} ${styles.Save}`}
                                            onClick={this.onSaveSecretClickHandler(
                                                secret.id,
                                            )}
                                        >
                                            <MaterialIconUI
                                                iconStyle={'outlined'}
                                            >
                                                save
                                            </MaterialIconUI>
                                        </div>
                                        <div
                                            className={`${styles.RowAction} ${styles.Delete}`}
                                            onClick={this.onDeleteSecretClickHandler(
                                                secret.id,
                                            )}
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
                                    key={appVersion.number}
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
                                (index: string, change) => (
                                    <div key={index} className={styles.Change}>
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
                                key={tab.key}
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
                    {this.renderRollouts()}
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

    private renderInlineGroup<GroupMember>(
        group: Group<GroupMember>,
        onInlineGroupClickHandler: (group: Group<GroupMember>) => () => void,
        selectedGroup?: Group<GroupMember>,
    ) {
        return (
            <div
                key={group.id}
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
            return (
                this.state.selectedUserGroup && (
                    <div className={`${styles.Box} ${styles.Group}`}>
                        <EditGroupViewComponent
                            ref={this.editGroupViewRef}
                            group={this.state.selectedUserGroup}
                            membersLabel={'Users'}
                            memberLabel={'User'}
                            renderInlineGroupMember={this.renderInlineUser}
                            renderInlineRollout={
                                this.renderInlineRolloutForEdit
                            }
                            isValidMember={this.isValidUser}
                            isValidRollout={this.isValidRollout}
                        />
                    </div>
                )
            );
        } else if (this.state.showGroupTabViews['teams']) {
            return (
                this.state.selectedTeamGroup && (
                    <div className={`${styles.Box} ${styles.Group}`}>
                        <EditGroupViewComponent
                            ref={this.editGroupViewRef}
                            group={this.state.selectedTeamGroup}
                            membersLabel={'Teams'}
                            memberLabel={'Team'}
                            renderInlineGroupMember={this.renderInlineTeam}
                            renderInlineRollout={
                                this.renderInlineRolloutForEdit
                            }
                            isValidMember={this.isValidTeam}
                            isValidRollout={this.isValidRollout}
                        />
                    </div>
                )
            );
        }
    }

    private renderRollouts() {
        if (this.state.showRolloutGroupTabViews['users']) {
            return (
                <>
                    <div
                        className={`${styles.Action} ${styles.CreateRollout}`}
                        onClick={this.onCreateUserRolloutClick}
                    >
                        Create Rollout
                    </div>
                    <div className={styles.RolloutList}>
                        {userGroupRollouts.map((rollout: Rollout<User>) =>
                            this.renderInlineRollout(
                                rollout,
                                this.onInlineUserRolloutClickHandler,
                                this.state.selectedUserGroupRollout,
                            ),
                        )}
                    </div>
                </>
            );
        } else if (this.state.showRolloutGroupTabViews['teams']) {
            return (
                <>
                    <div
                        className={`${styles.Action} ${styles.CreateRollout}`}
                        onClick={this.onCreateTeamRolloutClick}
                    >
                        Create Rollout
                    </div>
                    <div className={styles.RolloutList}>
                        {teamGroupRollouts.map((rollout: Rollout<Team>) =>
                            this.renderInlineRollout(
                                rollout,
                                this.onInlineTeamRolloutClickHandler,
                                this.state.selectedTeamGroupRollout,
                            ),
                        )}
                    </div>
                </>
            );
        }
    }

    private renderRolloutDetail(): ReactNode {
        if (this.state.showRolloutGroupTabViews['users']) {
            return (
                this.state.selectedUserGroupRollout && (
                    <div className={`${styles.Box} ${styles.Rollout}`}>
                        <EditUserGroupRolloutViewComponent
                            ref={this.editUserGroupRolloutViewRef}
                            rollout={this.state.selectedUserGroupRollout}
                            isValidVersionNumber={this.isValidVersionNumber}
                            renderInlineVersionNumber={
                                this.renderInlineVersionNumber
                            }
                        />
                    </div>
                )
            );
        } else if (this.state.showRolloutGroupTabViews['teams']) {
            return (
                this.state.selectedTeamGroupRollout && (
                    <div className={`${styles.Box} ${styles.Rollout}`}>
                        <EditTeamGroupRolloutViewComponent
                            ref={this.editTeamGroupRolloutViewRef}
                            rollout={this.state.selectedTeamGroupRollout}
                            isValidVersionNumber={this.isValidVersionNumber}
                            renderInlineVersionNumber={
                                this.renderInlineVersionNumber
                            }
                        />
                    </div>
                )
            );
        }
    }

    private renderInlineRollout<Group>(
        rollout: Rollout<Group>,
        onInlineRolloutClickHandler: (rollout: Rollout<Group>) => () => void,
        selectedRollout?: Rollout<Group>,
    ) {
        return (
            <div
                key={rollout.id}
                className={`${styles.Rollout} ${classNames({
                    [styles.Active]: selectedRollout?.id == rollout.id,
                })}`}
                onClick={onInlineRolloutClickHandler(rollout)}
            >
                <div className={styles.TopRow}>
                    <div className={`${styles.Attribute} ${styles.Id}`}>
                        {rollout.id}
                    </div>
                </div>
                <div className={styles.Name}>{rollout.name}</div>
                <div className={styles.CreatedAt}>
                    {moment(rollout.createdAt).fromNow()}
                </div>
            </div>
        );
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

    private renderInlineRolloutForEdit = (rolloutId: number): ReactNode => {
        // TODO: pull team
        const rollout =
            userGroupRollouts.find((rollout) => rollout.id == rolloutId) ||
            teamGroupRollouts.find((rollout) => rollout.id == rolloutId);
        return (
            rollout && (
                <div className={styles.InlineRollout}>
                    <div className={styles.Id}>{rollout.id}</div>
                    <div className={styles.Name}>{rollout.name}</div>
                </div>
            )
        );
    };

    private isValidTeam = (teamId: number): boolean => {
        // TODO: pull team
        return this.graphSource.team(teamId) !== undefined;
    };

    private isValidRollout = (rolloutId: number): boolean => {
        // TODO: pull rollout and read from store
        return (
            userGroupRollouts.some((rollout) => rollout.id == rolloutId) ||
            teamGroupRollouts.some((rollout) => rollout.id == rolloutId)
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
            switch (tab.key) {
                case 'users': {
                    this.editGroupViewRef.current?.show(
                        this.state.selectedUserGroup!,
                    );
                    break;
                }
                case 'teams': {
                    this.editGroupViewRef.current?.show(
                        this.state.selectedTeamGroup!,
                    );
                    break;
                }
            }
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

    private onInlineUserGroupClickHandler = (group: Group<User>) => {
        return () => {
            this.setState(
                {
                    selectedUserGroup: group,
                },
                () => {
                    this.editGroupViewRef.current?.show(group);
                },
            );
        };
    };

    private onInlineTeamGroupClickHandler = (group: Group<Team>) => {
        return () => {
            this.setState(
                {
                    selectedTeamGroup: group,
                },
                () => {
                    this.editGroupViewRef.current?.show(group);
                },
            );
        };
    };

    private onInlineUserRolloutClickHandler = (rollout: Rollout<User>) => {
        return () => {
            this.setState({
                selectedUserGroupRollout: rollout,
            });
            this.editUserGroupRolloutViewRef.current?.show(rollout);
        };
    };

    private onInlineTeamRolloutClickHandler = (rollout: Rollout<Team>) => {
        return () => {
            this.setState({
                selectedTeamGroupRollout: rollout,
            });
            this.editTeamGroupRolloutViewRef.current?.show(rollout);
        };
    };

    private onApiSecretNameChangeHandler = (apiSecretId: number) => {
        return (event: ChangeEvent<HTMLInputElement>) => {
            this.setState({
                apiSecretInputs: Object.assign({}, this.state.apiSecretInputs, {
                    [apiSecretId]: {
                        name: event.target.value,
                    },
                }),
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

    private onCreateUserRolloutClick = () => {
        this.createUserRolloutModalRef.current?.open();
    };

    private onCreateTeamRolloutClick = () => {
        this.createTeamRolloutModalRef.current?.open();
    };

    private onCopySecretClickHandler = (appSecretId: number) => {
        return async () => {
            // TODO: copy secret
            await this.feedbackPubSub.publish({
                type: 'AppSecretCopied',
                appSecretId: appSecretId,
            });
        };
    };

    private onSaveSecretClickHandler = (apiSecretId: number) => {
        return async () => {
            // TODO: save secret
        };
    };

    private onDeleteSecretClickHandler = (apiSecretId: number) => {
        return async () => {
            // TODO: delete secret
        };
    };
}
