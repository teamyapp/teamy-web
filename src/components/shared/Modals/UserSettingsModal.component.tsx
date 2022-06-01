import React, { Component, ReactNode, createRef } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';
import { TabsUI } from '@lib/ui/Tabs';
import { TextFieldUI } from '@lib/ui/TextField';

import { Deps } from '@core/dep/deps';
import { User } from '@core/entity/user';
import { GraphSource } from '@core/graph/graphSource';

import styles from './UserSettingsModal.component.module.scss';

interface Props {
    deps: Deps;
    onUserUpdated?: () => void;
}

interface State {
    user?: User;
    defaultTabIndex: number;
    currentTabIndex: number;
    editingUserFirstName?: string;
    editingUserLastName?: string;
}

export class UserSettingsModalComponent extends Component<Props, State> {
    private readonly graphSource: GraphSource;
    private readonly modalRef = createRef<ModalUI>();

    constructor(props: Props) {
        super(props);
        this.graphSource = props.deps.graphSource;
        this.state = {
            defaultTabIndex: 0,
            currentTabIndex: 0,
        };
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
                                    this.state.defaultTabIndex
                                }
                                tabNames={['Profile']}
                                onTabClick={this.onTabClick}
                            />
                        </div>
                        <div className={styles.TabContent}>
                            {this.renderUserProfileTab()}
                        </div>
                    </div>
                )}
            </ModalUI>
        );
    }

    public open = (user: User) => {
        this.setState({
            user,
            editingUserFirstName: user.firstName || '',
            editingUserLastName: user.lastName || '',
        });

        this.modalRef.current?.open();
    };

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
            editingUserLastName: newName
        });
    };

    private onSaveUserProfileClick = async () => {
        const user = this.state.user!;
        await this.graphSource.updateUser(user.id, {
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
