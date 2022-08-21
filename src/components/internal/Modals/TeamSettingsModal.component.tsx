import moment from 'moment';
import React, { Component, createRef } from 'react';

import { PopChannel } from '@lib/csp/csp';
import { closeIfNot } from '@lib/csp/lib';
import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';
import { TabsUI } from '@lib/ui/Tabs';
import { TextFieldUI } from '@lib/ui/TextField';
import { TooltipUI } from '@lib/ui/Tooltip';
import { Point } from '@lib/ui/position';

import { invitationLink } from '@core/config/routing';
import { orderByStatus } from '@core/data/invitation.order';
import { Deps } from '@core/dep/deps';
import { Invitation } from '@core/entity/invitation';
import { Team } from '@core/entity/team';
import { User } from '@core/entity/user';
import { GraphSource } from '@core/storage/graph/graphSource';
import { LocalStore } from '@core/storage/syncer/localStore';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import { ImageUploaderComponent } from '../ImageUploader.component';
import { UserProfileUI } from '../UserProfile';
import styles from './TeamSettingsModal.component.module.scss';

interface Props {
    deps: Deps;
    onAddTeamMemberClick?: (teamId: number) => void;
    onTeamUpdated?: () => void;
}

interface State {
    currentTabIndex: number;
    initialTeamName?: string;
    newTeamName?: string;
    team?: Team;
    invitations: Invitation[];
    modalPosition?: Point;
}

export class TeamSettingsModalComponent extends Component<Props, State> {
    private readonly localStore: LocalStore;
    private readonly graphSource: GraphSource;
    private readonly stateSyncer: StateSyncer;

    private readonly modalRef = createRef<ModalUI>();
    private onStateChangeChan?: PopChannel<boolean | undefined>;

    constructor(props: any) {
        super(props);
        this.localStore = props.deps.localStore;
        this.graphSource = props.deps.graphSource;
        this.stateSyncer = props.deps.stateSyncer;
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
                            Settings for {this.state.initialTeamName}
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
        this.onStateChangeChan = this.localStore.subscribeStateChange();
        (async () => {
            while (true) {
                const hasChanged = await this.onStateChangeChan?.pop();
                if (hasChanged === undefined) {
                    return;
                }

                if (this.state.team) {
                    await this.updateState(
                        this.state.team.id,
                        this.state.currentTabIndex,
                    );
                }
            }
        })();
    }

    public componentWillUnmount() {
        closeIfNot(this.onStateChangeChan);
    }

    public open = async (teamId: number, defaultTabIndex: number = 0) => {
        await this.stateSyncer.pullTeamMembers(teamId);
        await this.stateSyncer.pullTeamInvitations(teamId);
        await this.updateState(teamId, defaultTabIndex);
        this.modalRef.current?.open();
    };

    private async updateState(teamId: number, defaultTabIndex: number) {
        const team = await this.graphSource.team(teamId);
        let invitations = team!.invitations.map((invitation) => invitation);
        invitations = invitations.sort(
            (invitation1: Invitation, invitation2: Invitation) =>
                invitation1.createdAt.getTime() -
                invitation2.createdAt.getTime(),
        );
        this.setState({
            currentTabIndex: defaultTabIndex,
            team,
            initialTeamName: team?.name,
            newTeamName: team?.name,
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
                        <div className={styles.TeamIconUploader}>
                            <ImageUploaderComponent
                                imageAlt={this.state.team?.name}
                                emptyImagePlaceholder={this.state.team?.name[0]?.toUpperCase()}
                                fileUploadSessionFactory={
                                    this.props.deps.fileUploadSessionFactory
                                }
                                uploadButtonLabel='Upload icon'
                                createRemoteFileUploadSession={
                                    this.createRemoteFileUploadSession
                                }
                                activeImageUrl={this.state.team?.iconUrl}
                                onFileUploadFinished={
                                    this.handleFileUploadFinished
                                }
                                validateNewImage={this.validateTeamIconImage}
                            />
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
        const sortedInvitations = orderByStatus(this.state.invitations);
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
        if (this.state.team) {
            return (
                <div key={index} className={styles.Cell}>
                    <UserProfileUI user={user} />
                    <div className={styles.MemberName}>
                        <span>{user.firstName}</span>
                        &nbsp;
                        <span>{user.lastName}</span>
                    </div>
                    <div className={styles.Actions}>
                        {this.renderDeleteTeamMember(
                            this.state.team,
                            user.id,
                        )}
                    </div>
                </div>
            );
        }
    };

    private renderDeleteTeamMember(
        team: Team,
        userId: number,
    ) {
        if (team.owner.id !== userId) {
            return (
                <div className={styles.DeleteAction}
                     onClick={this.onDeleteTeamMemberClick(team.id, userId)}>
                    <MaterialIconUI iconStyle={'outline'}>
                        remove_circle
                    </MaterialIconUI>
                </div>
            );
        }
    }

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
            newTeamName: newName,
        });
    };

    private onSaveTeamProfileClick = async () => {
        const team = this.state.team!;
        await this.stateSyncer.updateTeam(team.id, {
            name: this.state.newTeamName!,
            iconUrl: team.iconUrl,
            ownerUserId: team.owner.id,
        });
        this.props.onTeamUpdated?.call(null);
        await this.props.deps.feedbackPubSub.publish({
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
            const link = invitationLink(invitation.id, invitation.code);
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(link);
                this.props.deps.feedbackPubSub.publish({
                    type: 'InvitationLinkCopied',
                    invitation: invitation,
                });
            }
        };
    };

    private onDeleteTeamMemberClick = (teamId: number, userId: number) => {
        return () => {
            this.stateSyncer.removeMemberFromTeam(teamId, userId);
        };
    };

    private onDeleteInvitationClick = (invitationId: number) => {
        return () => {
            // TODO: replace with mutation event
            this.stateSyncer.deleteInvitation(invitationId);
        };
    };

    private handleFileUploadFinished = async (fileUploadSessionId: number) => {
        await this.stateSyncer.finishTeamIconUpdateSession(
            this.state.team!.id,
            fileUploadSessionId,
        );
        const team = this.graphSource.currentTeam();
        this.setState({
            team,
        });
    };

    private validateTeamIconImage(image: HTMLImageElement) {
        const ratio = image.width / image.height;
        if (ratio !== 1) {
            alert('Team icon image need to be a square');
            return false;
        }

        if (image.width > 800) {
            alert(
                'Team icon image need to be smaller than or equal to 800 x 800',
            );
            return false;
        }
        return true;
    }

    private createRemoteFileUploadSession = () => {
        return this.stateSyncer.createTeamIconUpdateSession(
            this.state.team!.id,
        );
    };
}
