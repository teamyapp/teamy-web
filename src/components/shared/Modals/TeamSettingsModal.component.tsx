import moment from 'moment';
import React, { Component, createRef } from 'react';

import { PopChannel } from '@lib/csp/csp';
import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';
import { TabsUI } from '@lib/ui/Tabs';
import { TextFieldUI } from '@lib/ui/TextField';
import { TooltipUI } from '@lib/ui/Tooltip';
import { Point } from '@lib/ui/position';

import { invitationLink } from '@core/config/routing';
import { Deps } from '@core/dep/deps';
import { Invitation } from '@core/entity/invitation';
import { InvitationStatus } from '@core/entity/invitationStatus';
import { Team } from '@core/entity/team';
import { User } from '@core/entity/user';

import { UserProfileUI } from '../UserProfile';
import styles from './TeamSettingsModal.component.module.scss';

const invitationStatusOrder: Map<InvitationStatus, number> = new Map<
    InvitationStatus,
    number
>([
    ['ACCEPTED', 0],
    ['DECLINED', 1],
    ['EXPIRED', 2],
    ['PENDING', 3],
]);

interface Props {
    deps: Deps;
    onAddTeamMemberClick?: (teamId: string) => void;
    onTeamUpdated?: () => void;
}

interface State {
    currentTabIndex: number;
    initialTeamName?: string;
    team?: Team;
    invitations: Invitation[];
    modalPosition?: Point;
}

export class TeamSettingsModalComponent extends Component<Props, State> {
    private readonly modalRef = createRef<ModalUI>();
    private onSyncStateChan?: PopChannel<boolean | undefined>;

    constructor(props: any) {
        super(props);
        this.state = {
            currentTabIndex: 0,
            invitations: [],
        };
    }

    public render() {
        return (
            <ModalUI ref={this.modalRef}>
                {this.state.team && (
                    <div className={styles.TeamSettingsModal}>
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
                                    this.state.currentTabIndex
                                }
                                tabNames={['Profile', 'Members', 'Invitations']}
                                onTabClick={this.onTabClick}
                            />
                        </div>
                        <div className={styles.TabContent}>
                            {this.renderTeamProfileTab()}
                            {this.renderTeamMembersTab()}
                            {this.renderInvitationsTab()}
                        </div>
                    </div>
                )}
            </ModalUI>
        );
    }

    public componentDidMount() {
        this.onSyncStateChan =
            this.props.deps.networkStateSyncer.subscribeOnSyncState();
        (async () => {
            while (true) {
                const shouldSync = await this.onSyncStateChan?.pop();
                if (shouldSync === undefined) {
                    return;
                }

                if (this.state.team?.id) {
                    await this.syncState(
                        this.state.team?.id,
                        this.state.currentTabIndex,
                    );
                }
            }
        })();
    }

    public componentWillUnmount() {
        this.onSyncStateChan?.close();
    }

    public open = async (teamId: string, defaultTabIndex: number = 0) => {
        await this.syncState(teamId, defaultTabIndex);
        this.modalRef.current?.open();
    };

    private async syncState(teamId: string, defaultTabIndex: number) {
        const team = await this.props.deps.teamService.fetchTeam(teamId);
        let invitations =
            await this.props.deps.invitationService.findInvitationsForTeam(
                teamId,
                'network-only',
            );
        invitations = invitations.sort(
            (invitation1: Invitation, invitation2: Invitation) =>
                new Date(invitation1.createdAt).getTime() -
                new Date(invitation2.createdAt).getTime(),
        );
        this.setState({
            currentTabIndex: defaultTabIndex,
            team,
            initialTeamName: team.name,
            invitations,
        });
        setTimeout(() => {
            this.setState({
                modalPosition: this.modalRef.current?.Position(),
            });
        });
    }

    private renderTeamProfileTab = () => {
        return (
            this.state.currentTabIndex === 0 && (
                <div className={styles.TeamProfileTab}>
                    <div className={styles.TeamProfileTabContent}>
                        <div className={styles.TeamIcon}>
                            {this.state.team?.iconUrl ? (
                                <img
                                    alt={this.state.team?.name}
                                    className={styles.TeamIconImg}
                                    src={this.state.team?.iconUrl}
                                />
                            ) : (
                                <div className={styles.TeamIconDefault}>
                                    {this.state.team?.name[0]?.toUpperCase()}
                                </div>
                            )}

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
                    <div className={styles.Scrollable}>
                        <div className={styles.TeamMemberList}>
                            <div className={styles.Cell}>
                                <div
                                    className={styles.AddButton}
                                    onClick={this.onAddTeamMemberClick}
                                >
                                    <MaterialIconUI>add</MaterialIconUI>
                                </div>
                            </div>
                            {this.state.team?.members?.map(
                                this.renderTeamMember,
                            )}
                            {this.state.invitations
                                .filter(
                                    (invitation) =>
                                        invitation.status === 'PENDING',
                                )
                                .map(this.renderInvitedUser)}
                        </div>
                    </div>
                </div>
            )
        );
    };

    private renderInvitationsTab = () => {
        const sortedInvitations = this.state.invitations.sort(
            (invitation1, invitation2) => {
                return (
                    invitationStatusOrder.get(invitation1.status)! -
                    invitationStatusOrder.get(invitation2.status)!
                );
            },
        );
        return (
            this.state.currentTabIndex === 2 && (
                <div className={styles.InvitationsTab}>
                    <div className={styles.Scrollable}>
                        <table className={styles.Invitations}>
                            <thead>
                                <tr>
                                    <th>User ID</th>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                    <th>Expire At</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedInvitations.map(this.renderInvitation)}
                            </tbody>
                        </table>
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
                <div className={styles.Actions}>
                    <div className={styles.DeleteAction}>
                        <MaterialIconUI iconStyle={'outline'}>
                            remove_circle
                        </MaterialIconUI>
                    </div>
                </div>
            </div>
        );
    };

    private renderInvitedUser = (invitation: Invitation, index: number) => {
        const modalPosition = this.modalRef.current?.Position() || {
            left: 0,
            top: 0,
        };
        return (
            <div key={index} className={styles.Cell}>
                <div className={styles.InvitedUserProfile}>?</div>
                <div className={styles.MemberName}>
                    <span>{invitation.receiverFirstName}</span>
                    &nbsp;
                    <span>{invitation.receiverLastName}</span>
                </div>
                <div className={`${styles.InvitationStatus} ${styles.PENDING}`}>
                    {invitation.status}
                </div>
                <div className={styles.Actions}>
                    {this.renderDeleteInvitationAction(
                        invitation,
                        modalPosition,
                    )}
                </div>
            </div>
        );
    };

    private renderInvitation = (invitation: Invitation, index: number) => {
        return (
            <tr key={index} className={styles.Invitation}>
                <td>{invitation.receiver?.id}</td>
                <td className={styles.FirstName}>
                    {invitation.receiverFirstName}
                </td>
                <td className={styles.LastName}>
                    {invitation.receiverLastName}
                </td>
                <td>
                    <div
                        className={`${styles.InvitationStatus} ${
                            styles[invitation.status]
                        }`}
                    >
                        {invitation.status}
                    </div>
                </td>
                <td>{moment(invitation.createdAt).calendar()}</td>
                <td>{moment(invitation.expireAt).calendar()}</td>
                <td className={styles.Actions}>
                    <TooltipUI
                        message={'Copy Link'}
                        parentOffset={this.state.modalPosition}
                    >
                        <div
                            className={`${styles.Action} ${styles.CopyLinkAction}`}
                            onClick={this.onCopyInvitationLinkClick(invitation)}
                        >
                            <MaterialIconUI iconStyle={'outline'}>
                                link
                            </MaterialIconUI>
                        </div>
                    </TooltipUI>
                    {this.renderDeleteInvitationAction(
                        invitation,
                        this.state.modalPosition!,
                    )}
                </td>
            </tr>
        );
    };

    private renderDeleteInvitationAction(
        invitation: Invitation,
        modalPosition: Point,
    ) {
        return (
            <TooltipUI message={'Delete'} parentOffset={modalPosition}>
                <div
                    className={`${styles.Action} ${styles.DeleteAction}`}
                    onClick={this.onDeleteInvitationClick(invitation.id)}
                >
                    <MaterialIconUI iconStyle={'outline'}>
                        remove_circle
                    </MaterialIconUI>
                </div>
            </TooltipUI>
        );
    }

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
        this.props.deps.teamService.updateTeam(this.state.team!);
        this.props.onTeamUpdated?.call(null);
        this.props.deps.feedbackPubSub.publish({
            type: 'TeamProfileUpdated',
        });
    };

    private onDeleteTeamClick = () => {
        console.log('onDeleteTeamClick');
    };

    private onAddTeamMemberClick = async () => {
        await this.props.onAddTeamMemberClick?.call(null, this.state.team!.id);
    };

    private onCopyInvitationLinkClick = (invitation: Invitation) => {
        return async () => {
            const link = invitationLink(invitation.code);
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(link);
                this.props.deps.feedbackPubSub.publish({
                    type: 'InvitationLinkCopied',
                    invitation: invitation,
                });
            }
        };
    };

    private onDeleteInvitationClick = (invitationId: string) => {
        return async () => {
            // TODO: replace with mutation event
            await this.props.deps.invitationService.deleteInvitation(
                invitationId,
            );
            await this.props.deps.networkStateSyncer.syncState();
        };
    };
}
