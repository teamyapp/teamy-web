import React, {
    ChangeEvent,
    Component,
    createRef,
    Fragment,
    ReactNode,
} from 'react';

import {PopChannel} from '@lib/csp/csp';
import {FileUploadSessionFactory} from '@lib/fileUpload/fileUploadSession';
import {Progress} from '@lib/fileUpload/progress';
import {Router} from '@lib/router/router';
import {ButtonUI} from '@lib/ui/Button';
import {MaterialIconUI} from '@lib/ui/MaterialIcon';
import {ModalUI} from '@lib/ui/Modal';
import {TabsUI} from '@lib/ui/Tabs';
import {TextFieldUI} from '@lib/ui/TextField';

import {absoluteUri} from '@core/config/routing';
import {Deps} from '@core/dep/deps';
import {
    accountProviderNames,
    AuthProvider,
    authProviders,
    LinkedUser,
} from '@core/entity/linkedUser';
import {User} from '@core/entity/user';
import {GraphSource} from '@core/storage/graph/graphSource';
import {LocalStore} from '@core/storage/syncer/localStore';
import {StateSyncer} from '@core/storage/syncer/stateSyncer';

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
    isPreviewingProfileImage: boolean;
    previewProfileImageUrl?: string;
    profileUploadProgress: Progress;
}

export class UserSettingsModalComponent extends Component<Props, State> {
    private readonly localStore: LocalStore;
    private readonly graphSource: GraphSource;
    private readonly stateSyncer: StateSyncer;
    private readonly router: Router;
    private readonly fileUploadSessionFactory: FileUploadSessionFactory;
    private readonly modalRef = createRef<ModalUI>();

    private onStateChangeChan?: PopChannel<boolean | undefined>;

    constructor(props: Props) {
        super(props);
        this.localStore = props.deps.localStore;
        this.graphSource = props.deps.graphSource;
        this.stateSyncer = props.deps.stateSyncer;
        this.stateSyncer = props.deps.stateSyncer;
        this.router = props.deps.router;
        this.fileUploadSessionFactory = props.deps.fileUploadSessionFactory;
        this.state = {
            currentTabIndex: 0,
            linkedUsers: new Map<AuthProvider, LinkedUser>(),
            isPreviewingProfileImage: false,
            profileUploadProgress: {
                newBytesUploaded: 0,
                totalPercentage: 0,
            },
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
                        {this.renderUserProfile()}
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

    private renderUserProfile(): ReactNode {
        return (
            <div className={styles.UserProfile}>
                {
                    this.state.isPreviewingProfileImage ?
                        this.renderUserProfilePreview() :
                        this.renderActiveUserProfile()
                }
            </div>
        );
    }

    private renderUserProfilePreview() {
        return (
            <Fragment>
                <img
                    alt={`${this.state.editingUserFirstName} ${this.state.editingUserLastName}`}
                    className={styles.UserProfileImg}
                    src={this.state.previewProfileImageUrl}
                />
                <div
                    className={styles.UploadProgress}
                    style={{
                        top: `${this.state.profileUploadProgress.totalPercentage}%`,
                    }}
                />
            </Fragment>
        );
    }

    private renderActiveUserProfile() {
        return (
            <Fragment>
                {this.state.user?.profileUrl ? (
                    <img
                        alt={`${this.state.editingUserFirstName} ${this.state.editingUserLastName}`}
                        className={styles.UserProfileImg}
                        src={this.state.user?.profileUrl}
                    />
                ) : (
                    <div className={styles.DefaultUserProfile}>
                        {this.state.editingUserFirstName &&
                            this.state.editingUserFirstName[0].toUpperCase()}
                    </div>
                )}
                <div className={styles.UploadUserProfileButton}>
                    <input
                        type={'file'}
                        className={styles.FileInput}
                        title=""
                        accept="image/png,image/jpeg,image/bmp,image/svg+xml"
                        onChange={this.onProfileImageChange}
                    />
                    <div className={styles.Label}>Upload profile</div>
                </div>
            </Fragment>
        );
    }

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
                            <ButtonUI
                                label={'Disconnect'}
                                onClick={this.onDisconnectExternalAccountClick(
                                    authProvider,
                                )}
                            />
                        </div>
                    ) : (
                        <div className={styles.Connect}>
                            <ButtonUI
                                label={'Connect'}
                                onClick={this.onConnectExternalAccountClick(
                                    authProvider,
                                )}
                            />
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

    private onConnectExternalAccountClick = (authProvider: AuthProvider) => {
        return () => {
            this.props.deps.identityClient.createUserLink(
                authProvider,
                absoluteUri(this.router.currentUri!),
            );
        };
    };

    private onDisconnectExternalAccountClick = (authProvider: AuthProvider) => {
        return async () => {
            await this.props.deps.identityClient.deleteUserLink(authProvider);
            this.stateSyncer.pullUserLinks();
        };
    };

    private onProfileImageChange = async (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const files = event.target.files;
        if (!files || files.length < 1) {
            return;
        }

        const file = files[0];
        const previewImageUrl = URL.createObjectURL(file);
        const image = await loadImage(previewImageUrl);
        const ratio = image.width / image.height;
        if (ratio !== 1) {
            alert('Profile image need to be a square');
            return;
        }

        if (image.width > 800) {
            alert(
                'Profile image need to be smaller than or equal to 800 x 800',
            );
            return;
        }

        this.setState({
            isPreviewingProfileImage: true,
            previewProfileImageUrl: previewImageUrl,
            profileUploadProgress: {
                newBytesUploaded: 0,
                totalPercentage: 0,
            },
        });

        const fileUploadSessionId =
            await this.stateSyncer.createUserProfileUpdateSession();
        const uploadSession =
            this.fileUploadSessionFactory.createFileUploadSession(
                fileUploadSessionId,
            );
        const onNewProgressCh = uploadSession.subscribeNewProgress();
        (async () => {
            while (true) {
                const progress = await onNewProgressCh.pop();
                if (progress === undefined) {
                    return;
                }

                this.setState({
                    profileUploadProgress: progress,
                });
            }
        })().then();
        const error = await uploadSession.uploadFile(file);
        if (error) {
            alert('Fail to upload profile image');
        } else {
            await this.stateSyncer.finishUserProfileUpdateSession(
                fileUploadSessionId,
            );
            await this.stateSyncer.pullCurrentUser();
            const user = this.graphSource.currentUser();
            this.setState({
                user,
            });
        }

        this.setState({
            isPreviewingProfileImage: false,
        });
    };
}

function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            resolve(image);
        };
        image.src = url;
    });
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
