import React, { Component, createRef } from 'react';
import { Deps } from '../../deps';
import Team from '../../entity/Team';
import { User } from '../../entity/User';
import MaterialIconComponent from '../ui/MaterialIcon.component';
import ModalComponent from '../ui/Modal.component';
import TabsComponent from '../ui/Tabs.component';
import TextFieldComponent from '../ui/TextField.component';
import styles from './TeamModal.component.module.scss';
import { UserProfile } from './UserProfile.component';

interface IProps {
    deps: Deps;
}

interface IState {
    defaultTabIndex: number;
    currentTabIndex: number;
    initialTeamName?: string;
    team?: Team;
}

export class TeamSettingsModalComponent extends Component<IProps, IState> {
    private modalRef = createRef<ModalComponent>();

    constructor(props: any) {
        super(props);
        this.state = {
            defaultTabIndex: -1,
            currentTabIndex: -1,
        };
    }

    public render() {
        return (
            <ModalComponent ref={this.modalRef}>
                {this.state.team && (
                    <div className={styles.TeamModal}>
                        <div className={styles.Header}>
                            Team {this.state.initialTeamName}
                            <div
                                className={styles.CloseButton}
                                onClick={this.onCloseButtonClick}
                            >
                                <MaterialIconComponent>
                                    cancel
                                </MaterialIconComponent>
                            </div>
                        </div>
                        <div key={0} className={styles.Tabs}>
                            <TabsComponent
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
            </ModalComponent>
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
                                className={styles.TeamIconImg}
                                src={this.state.team?.iconUrl}
                            />
                        </div>
                        <div className={styles.TeamNameSection}>
                            <TextFieldComponent
                                value={this.state.team?.name}
                                label={'Name'}
                                onChange={this.onTeamNameChange}
                            />
                        </div>
                        <div className={styles.ActionsSection}>
                            <div
                                className={`${styles.Action} ${styles.SaveAction}`}
                            >
                                Save
                            </div>
                            <div
                                className={`${styles.Action} ${styles.DeleteTeamAction}`}
                            >
                                Delete Team
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
                <div className={styles.TeamMemberTab}>
                    <div className={styles.Cell}>
                        <div className={styles.AddButton}>
                            <MaterialIconComponent>add</MaterialIconComponent>
                        </div>
                    </div>
                    {this.state.team?.members?.map(this.renderTeamMember)}
                </div>
            )
        );
    };

    private renderTeamMember = (user: User, index: number) => {
        return (
            <div key={index} className={styles.Cell}>
                <UserProfile user={user} />
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
}
