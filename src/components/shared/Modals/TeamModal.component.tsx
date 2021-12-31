import React, { Component, createRef } from 'react';

import { Deps } from '@deps';
import { Team } from '@entity/team';
import { User } from '@entity/user';
import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';
import { TabsUI } from '@lib/ui/Tabs';
import { TextFieldUI } from '@lib/ui/TextField';

import { UserProfileUI } from '../UserProfile';
import styles from './TeamModal.component.module.scss';

interface IProps {
    deps: Deps;
    onAddTeamMemberClick?: (teamId: number) => void;
}

interface IState {
    defaultTabIndex: number;
    currentTabIndex: number;
    initialTeamName?: string;
    team?: Team;
}

export class TeamSettingsModalComponent extends Component<IProps, IState> {
    private modalRef = createRef<ModalUI>();

    constructor(props: any) {
        super(props);
        this.state = {
            defaultTabIndex: -1,
            currentTabIndex: -1,
        };
    }

    public render() {
        return (
            <ModalUI ref={this.modalRef}>
                {this.state.team && (
                    <div className={styles.TeamModal}>
                        <div className={styles.Header}>
                            Team {this.state.initialTeamName}
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
                                tabNames={['Profile', 'Members']}
                                onTabClick={this.onTabClick}
                            />
                        </div>
                        <div className={styles.TabContent}>
                            {this.renderTeamProfileTab()}
                            {this.renderTeamMembersTab()}
                        </div>
                    </div>
                )}
            </ModalUI>
        );
    }

    public open = async (teamId: number, defaultTabIndex: number = 0) => {
        const team = await this.props.deps.teamService.fetchTeam(teamId);
        this.setState({
            defaultTabIndex,
            currentTabIndex: defaultTabIndex,
            team,
            initialTeamName: team.name,
        });
        this.modalRef.current?.open();
    };

    private renderTeamProfileTab = () => {
        return (
            this.state.currentTabIndex === 0 && (
                <div className={styles.TeamProfileTab}>
                    <div className={styles.TeamProfileTabContent}>
                        <div className={styles.TeamIcon}>
                            <img
                                alt={this.state.team?.name}
                                className={styles.TeamIconImg}
                                src={this.state.team?.iconUrl}
                            />
                            <div className={styles.UploadTeamIconButton}>
                                Upload profile
                            </div>
                        </div>
                        <div className={styles.TeamNameSection}>
                            <TextFieldUI
                                value={this.state.team?.name}
                                label={'Name'}
                                onChange={this.onTeamNameChange}
                            />
                        </div>
                        <div className={styles.ActionsSection}>
                            <div className={styles.SaveAction}>
                                <ButtonUI
                                    label={'Save'}
                                    onClick={this.onSaveTeamProfileClick}
                                />
                            </div>
                            <div className={styles.DeleteTeamAction}>
                                <ButtonUI
                                    label={'Delete Team'}
                                    onClick={this.onDeleteTeamClick}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )
        );
    };

    private renderTeamMembersTab = () => {
        return (
            this.state.currentTabIndex === 1 && (
                <div className={styles.TeamMembersTab}>
                    <div className={styles.TeamMemberList}>
                        <div className={styles.Cell}>
                            <div
                                className={styles.AddButton}
                                onClick={this.onAddTeamMemberClick}
                            >
                                <MaterialIconUI>add</MaterialIconUI>
                            </div>
                        </div>
                        {this.state.team?.members?.map(this.renderTeamMember)}
                    </div>
                </div>
            )
        );
    };

    private renderTeamMember = (user: User, index: number) => {
        return (
            <div key={index} className={styles.Cell}>
                <UserProfileUI user={user} />
                <div className={styles.MemberName}>
                    <span>{user.firstName}</span>
                    &nbsp;
                    <span>{user.lastName}</span>
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

    private onTeamNameChange = (newName: string) => {
        this.setState({
            team: Object.assign({}, this.state.team, {
                name: newName,
            }),
        });
    };

    private onSaveTeamProfileClick = () => {
        console.log('onSaveTeamProfileClick');
    };

    private onDeleteTeamClick = () => {
        console.log('onDeleteTeamClick');
    };

    private onAddTeamMemberClick = () => {
        this.props.onAddTeamMemberClick?.call(null, this.state.team!.id);
    };
}
