import React, { Component, ReactNode, createRef } from 'react';

import { PopChannel } from '@lib/csp/csp';
import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';
import { TabsUI } from '@lib/ui/Tabs';
import { TextFieldUI } from '@lib/ui/TextField';

import { Deps } from '@core/dep/deps';
import {
    AuthProvider,
    LinkedUser,
    accountProviderNames,
    authProviders,
} from '@core/entity/linkedUser';
import { User } from '@core/entity/user';
import { GraphSource } from '@core/storage/graph/graphSource';
import { LocalStore } from '@core/storage/syncer/localStore';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import styles from './UserSettingsModal.component.module.scss';
import github from './accountProviders/github.svg';
import google from './accountProviders/google.svg';
import microsoft from './accountProviders/microsoft.svg';
import slack from './accountProviders/slack.svg';
import wechat from './accountProviders/wechat.svg';

const accountProvidersComingSoon: AuthProvider[] = [
    'wechat',
    'microsoft',
    'slack',
];

interface Props {
    deps: Deps;
    onUserUpdated?: () => void;
}

interface State {
    user?: User;
    linkedUsers: Map<AuthProvider, LinkedUser>;
    currentTabIndex: number;
    editingUserFirstName?: string;
    editingUserLastName?: string;
}

export class UserSettingsModalComponent extends Component<Props, State> {
    private readonly localStore: LocalStore;
    private readonly graphSource: GraphSource;
    private readonly stateSyncer: StateSyncer;
    private readonly modalRef = createRef<ModalUI>();

    private onStateChangeChan?: PopChannel<boolean | undefined>;

    constructor(props: Props) {
        super(props);
        this.localStore = props.deps.localStore;
        this.graphSource = props.deps.graphSource;
        this.stateSyncer = props.deps.stateSyncer;
        this.stateSyncer = props.deps.stateSyncer;
        this.state = {
            currentTabIndex: 0,
            linkedUsers: new Map<AuthProvider, LinkedUser>(),
        };
    }

    public componentDidMount() {
        this.onStateChangeChan = this.localStore.subscribeStateChange();
        (async () => {
            while (true) {
                const hasChanged = await this.onStateChangeChan?.pop();
                if (hasChanged === undefined) {
                    return;
                }

                if (this.state.user) {
                    const user = this.graphSource.user(this.state.user.id);
                    await this.updateState(user!);
                }
            }
        })();
    }

    public render(): ReactNode {
        return (
            <ModalUI ref={this.modalRef}>
                {this.state.user && (
                    <div className={styles.UserSettingsModal}>
                        <div className={styles.Header}>
                            User Settings
                            <div
                                className={styles.CloseButton}
                                onClick={this.onCloseButtonClick}
                            >
                                <MaterialIconUI>cancel</MaterialIconUI>
                            </div>
                        </div>
                        <div key={0} className={styles.Tabs}>
                            <TabsUI
                                defaultSelectedIndex={
                                    this.state.currentTabIndex
                                }
                                tabNames={['Profile', 'Accounts']}
                                onTabClick={this.onTabClick}
                            />
                        </div>
                        <div className={styles.TabContent}>
                            {this.renderUserProfileTab()}
                            {this.renderAccountsTab()}
                        </div>
                    </div>
                )}
            </ModalUI>
        );
    }

    public open = async (user: User) => {
        this.updateState(user);
        this.stateSyncer.pullUserLinks();
        this.modalRef.current?.open();
    };

    private updateState(user: User) {
        const linkedUsers = new Map<AuthProvider, LinkedUser>();
        user.linkedUsers.forEach((linkedUser) => {
            linkedUsers.set(linkedUser.authProvider, linkedUser);
        });
        this.setState({
            user,
            editingUserFirstName: user.firstName || '',
            editingUserLastName: user.lastName || '',
            linkedUsers: linkedUsers,
        });
    }

    private renderUserProfileTab = () => {
        return (
            this.state.currentTabIndex === 0 && (
                <div className={styles.UserProfileTab}>
                    <div className={styles.UserProfileTabContent}>
                        <div className={styles.UserProfile}>
                            {this.state.user?.profileUrl ? (
                                <img
                                    alt={`${this.state.editingUserFirstName} ${this.state.editingUserLastName}`}
                                    className={styles.UserProfileImg}
                                    src={this.state.user?.profileUrl}
                                />
                            ) : (
                                <div className={styles.DefaultUserProfile}>
                                    {this.state.editingUserLastName &&
                                        this.state.editingUserLastName[0].toUpperCase()}
                                </div>
                            )}

                            <div className={styles.UploadUserProfileButton}>
                                Upload profile
                            </div>
                        </div>
                        <div className={styles.UserIdSection}>
                            <div>ID:</div>
                            <div className={styles.UserId}>
                                {this.state.user?.id}
                            </div>
                        </div>
                        <div className={styles.UserNameSection}>
                            <div className={styles.Row}>
                                <TextFieldUI
                                    value={this.state.editingUserFirstName}
                                    label={'First name'}
                                    onChange={this.onUserFirstNameChange}
                                />
                            </div>
                            <div className={styles.Row}>
                                <TextFieldUI
                                    value={this.state.editingUserLastName}
                                    label={'Last name'}
                                    onChange={this.onUserLastNameChange}
                                />
                            </div>
                        </div>
                        <div className={styles.ActionsSection}>
                            <div className={styles.SaveAction}>
                                <ButtonUI
                                    label={'Save'}
                                    onClick={this.onSaveUserProfileClick}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )
        );
    };

    private renderAccountsTab = () => {
        return (
            this.state.currentTabIndex === 1 && (
                <div className={styles.AccountsTab}>
                    <div className={styles.Content}>
                        <div className={styles.Title}>External Accounts</div>
                        <div className={styles.ExternalAccounts}>
                            {authProviders.map(this.renderExternalAccount)}
                        </div>
                    </div>
                </div>
            )
        );
    };

    private renderExternalAccount = (
        authProvider: AuthProvider,
        index: number,
    ): ReactNode => {
        const linkedUser = this.state.linkedUsers.get(authProvider);
        return (
            <div className={styles.ExternalAccount} key={index}>
                <div className={styles.AccountProvider}>
                    <div className={styles.Logo}>
                        <img
                            alt={accountProviderNames[authProvider]}
                            src={renderAccountProviderLogoURL(authProvider)}
                        />
                    </div>
                    <div className={styles.Name}>
                        {accountProviderNames[authProvider]}
                    </div>
                </div>
                <div className={styles.UserLabel}>
                    {linkedUser && linkedUser.label}
                </div>
                {accountProvidersComingSoon.includes(authProvider) && (
                    <div className={styles.ComingSoon}>(Coming Soon)</div>
                )}
                <div className={styles.Action}>
                    {linkedUser ? (
                        <div className={styles.Disconnect}>
                            <ButtonUI label={'Disconnect'} />
                        </div>
                    ) : (
                        <div className={styles.Connect}>
                            <ButtonUI label={'Connect'} />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    private onCloseButtonClick = () => {
        this.modalRef.current?.close();
    };

    private onTabClick = (tabIndex: number) => {
        this.setState({
            currentTabIndex: tabIndex,
        });
    };

    private onUserFirstNameChange = (newName: string) => {
        this.setState({
            editingUserFirstName: newName,
        });
    };

    private onUserLastNameChange = (newName: string) => {
        this.setState({
            editingUserLastName: newName,
        });
    };

    private onSaveUserProfileClick = async () => {
        const user = this.state.user!;
        await this.stateSyncer.updateUser(user.id, {
            firstName: this.state.editingUserFirstName!,
            lastName: this.state.editingUserLastName!,
            profileUrl: user.profileUrl,
        });
        this.props.onUserUpdated?.call(null);
        await this.props.deps.feedbackPubSub.publish({
            type: 'UserProfileUpdated',
        });
    };
}

function renderAccountProviderLogoURL(authProvider: AuthProvider): any {
    switch (authProvider) {
        case 'google':
            return google;
        case 'microsoft':
            return microsoft;
        case 'github':
            return github;
        case 'slack':
            return slack;
        case 'wechat':
            return wechat;
    }
}
