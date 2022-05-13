import React, { Component, ReactNode, createRef } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';
import { TabsUI } from '@lib/ui/Tabs';
import { TextFieldUI } from '@lib/ui/TextField';

import { Deps } from '@core/dep/deps';
import { User } from '@core/entity/user';

import styles from './UserSettingsModal.component.module.scss';

interface IProps {
    deps: Deps;
    onUserUpdated?: () => void;
}

interface IState {
    user?: User;
    defaultTabIndex: number;
    currentTabIndex: number;
    initialUserFirstName?: string;
    initialUserLastName?: string;
}

export class UserSettingsModalComponent extends Component<IProps, IState> {
    private readonly modalRef = createRef<ModalUI>();

    constructor(props: IProps) {
        super(props);
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
            initialUserFirstName: user.firstName || '',
            initialUserLastName: user.lastName || '',
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
                                    alt={`${this.state.user?.firstName} ${this.state.user?.lastName}`}
                                    className={styles.UserProfileImg}
                                    src={this.state.user?.profileUrl}
                                />
                            ) : (
                                <div className={styles.DefaultUserProfile}>
                                    {this.state.user?.firstName &&
                                        this.state.user?.firstName[0].toUpperCase()}
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
                                    value={this.state.user?.firstName}
                                    label={'First name'}
                                    onChange={this.onUserFirstNameChange}
                                />
                            </div>
                            <div className={styles.Row}>
                                <TextFieldUI
                                    value={this.state.user?.lastName}
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
            user: Object.assign({}, this.state.user, {
                firstName: newName,
            }),
        });
    };

    private onUserLastNameChange = (newName: string) => {
        this.setState({
            user: Object.assign({}, this.state.user, {
                lastName: newName,
            }),
        });
    };

    private onSaveUserProfileClick = async () => {
        await this.props.deps.userService.updateUser(this.state.user!);
        this.props.onUserUpdated?.call(null);
        await this.props.deps.feedbackPubSub.publish({
            type: 'UserProfileUpdated',
        });
    };
}
