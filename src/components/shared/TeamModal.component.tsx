import React, { Component, createRef } from 'react';
import { Deps } from '../../deps';
import Team from '../../entity/Team';
import { User } from '../../entity/User';
import MaterialIconComponent from '../ui/MaterialIcon.component';
import ModalComponent from '../ui/Modal.component';
import TabsComponent from '../ui/Tabs.component';
import styles from './TeamModal.component.module.scss';
import { UserProfile } from './UserProfile.component';

interface IProps {
    deps: Deps;
}

interface IState {
    defaultTabIndex: number;
    currentTabIndex: number;
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
                            Team {this.state.team.name}
                            <div
                                className={styles.CloseButton}
                                onClick={this.onCloseButtonClick}
                            >
                                <MaterialIconComponent>
                                    cancel
                                </MaterialIconComponent>
                            </div>
                        </div>
                        <div>
                            <div className={styles.Tabs}>
                                <TabsComponent
                                    defaultSelectedIndex={
                                        this.state.defaultTabIndex
                                    }
                                    tabNames={['Settings', 'Members']}
                                    onTabClick={this.onTabClick}
                                />
                            </div>
                            <div>
                                {this.renderTeamSettingsTab()}
                                {this.renderTeamMembersTab()}
                            </div>
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
        });
        this.modalRef.current?.open();
    };

    private renderTeamSettingsTab = () => {
        return (
            this.state.currentTabIndex === 0 && (
                <div className={styles.TeamSettingsTab}></div>
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

    private renderTeamMember = (user: User) => {
        return (
            <div className={styles.Cell}>
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
}
