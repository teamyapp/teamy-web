import moment from 'moment';
import React, { Component, ReactNode, createRef } from 'react';

import { PopChannel } from '@lib/csp/csp';
import { closeIfNot } from '@lib/csp/lib';
import { RelativeLayout } from '@lib/layout';
import { Router } from '@lib/router/router';
import { Duration } from '@lib/time/duration';
import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';
import { TabsUI } from '@lib/ui/Tabs';
import { TextFieldUI } from '@lib/ui/TextField';
import { TooltipUI } from '@lib/ui/Tooltip';
import { Point } from '@lib/ui/position';

import { orderByStatus } from '@core/data/invitation.order';
import { Deps } from '@core/dep/deps';
import { Invitation } from '@core/entity/invitation';
import { Team } from '@core/entity/team';
import { TeamMember } from '@core/entity/teamMember';
import { invitationLink, teamsRoutePattern } from '@core/routing/routes';
import { GraphSource } from '@core/storage/graph/graphSource';
import { LocalStore } from '@core/storage/syncer/localStore';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import { DurationInputUI } from '../DurationInput.ui';
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
}

export class TeamSettingsModalComponent extends Component<Props, State> {
    private readonly router: Router;
    private readonly localStore: LocalStore;
    private readonly graphSource: GraphSource;
    private readonly stateSyncer: StateSyncer;
    private readonly relativeLayout: RelativeLayout;

    private readonly modalRef = createRef<ModalUI>();
    private onStateChangeChan?: PopChannel<boolean | undefined>;

    constructor(props: any) {
        super(props);
        this.router = props.deps.router;
        this.localStore = props.deps.localStore;
        this.graphSource = props.deps.graphSource;
        this.stateSyncer = props.deps.stateSyncer;
        this.relativeLayout = props.deps.relativeLayout;
        this.state = {
            currentTabIndex: 0,
            invitations: [],
        };
    }

    public render() {
        return (
            <ModalUI ariaLabel={'Team Setting'} ref={this.modalRef}>
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
                        <div className={styles.Tabs}>
                            <TabsUI
                                defaultSelectedIndex={
                                    this.state.currentTabIndex
                                }
                                tabNames={[
                                    'Profile',
                                    'Bandwidth',
                                    'Members',
                                    'Invitations',
                                ]}
                                onTabClick={this.onTabClick}
                            />
                        </div>
                        <div className={styles.TabContent}>
                            {this.renderTab()}
                        </div>
                    </div>
                )}
            </ModalUI>
        );
    }

    public open = async (teamId: number, defaultTabIndex: number = 0) => {
        await this.stateSyncer.pullTeamMembers(teamId);
        await this.stateSyncer.pullTeamInvitations(teamId);
        await this.updateState(teamId, defaultTabIndex);
        this.init(teamId);
        this.modalRef.current?.open();
    };

    private renderTab = (): ReactNode => {
        switch (this.state.currentTabIndex) {
            case 0:
                return this.renderTeamProfileTab();
            case 1:
                return this.renderBandwidthTab();
            case 2:
                return this.renderTeamMembersTab();
            case 3:
                return this.renderInvitationsTab();
        }
    };

    private init(teamID: number) {
        this.onStateChangeChan = this.localStore.subscribeStateChange();
        (async () => {
            while (true) {
                const hasChanged = await this.onStateChangeChan?.pop();
                if (hasChanged === undefined) {
                    return;
                }

                await this.updateState(teamID, this.state.currentTabIndex);
            }
        })().then();
    }

    private async updateState(teamId: number, defaultTabIndex: number) {
        const team = await this.graphSource.team(teamId);
        if (!team) {
            return;
        }

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
    }

    private renderTeamProfileTab = () => {
        return (
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
                            onFileUploadFinished={this.handleFileUploadFinished}
                            validateNewImage={this.validateTeamIconImage}
                        />
                    </div>
                    <div className={styles.IdSection}>
                        <div>ID:</div>
                        <div className={styles.Id}>{this.state.team?.id}</div>
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
        );
    };

    private renderTeamMembersTab = () => {
        return (
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
                        {this.state.team?.members?.map(this.renderTeamMember)}
                        {this.state.invitations
                            .filter(
                                (invitation) => invitation.status === 'PENDING',
                            )
                            .map(this.renderInvitedUser)}
                    </div>
                </div>
            </div>
        );
    };

    private renderInvitationsTab = () => {
        const sortedInvitations = orderByStatus(this.state.invitations);
        return (
            <div className={styles.InvitationsTab}>
                <div className={styles.Scrollable}>
                    <table className={styles.Table}>
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
        );
    };

    private renderBandwidthTab = () => {
        let teamMembers = this.state.team?.members || [];
        teamMembers = teamMembers
            .map((member) => member)
            .sort((member1, member2) => member1.user.id - member2.user.id);
        return (
            <div className={styles.BandwidthTab}>
                <div className={styles.Scrollable}>
                    <table className={styles.Table}>
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Profile</th>
                                <th>Name</th>
                                <th>Weekly Bandwidth</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamMembers.map(this.renderMemberBandwidth)}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    private renderMemberBandwidth = (
        member: TeamMember,
        index: number,
    ): ReactNode => {
        const { user } = member;
        const bandwidthDuration =
            member.weeklyBandwidth.totalMilliSeconds === 0
                ? undefined
                : member.weeklyBandwidth;
        return (
            <tr key={member.user.id} className={styles.Row}>
                <td>{user.id}</td>
                <td className={styles.ProfileColumn}>
                    <div className={styles.Profile}>
                        <UserProfileUI user={user} />
                    </div>
                </td>
                <td>
                    {user.firstName} {user.lastName}
                </td>
                <td className={styles.BandwidthColumn}>
                    <div className={styles.Duration}>
                        <DurationInputUI
                            zOffset={1000}
                            relativeLayout={this.relativeLayout}
                            duration={bandwidthDuration}
                            icon={
                                <MaterialIconUI iconStyle={'outlined'}>
                                    electric_bolt
                                </MaterialIconUI>
                            }
                            onDurationChange={this.onMemberBandwidthChange(
                                member,
                            )}
                        />
                    </div>
                </td>
            </tr>
        );
    };

    private renderTeamMember = (teamMember: TeamMember) => {
        const currUserId = this.graphSource.currentUser()!.id;
        const user = teamMember.user;
        return (
            <div key={teamMember.user.id} className={styles.Cell}>
                <UserProfileUI user={user} />
                <div className={styles.MemberName}>
                    <span>{user.firstName}</span>
                    &nbsp;
                    <span>{user.lastName}</span>
                </div>
                <div className={styles.Actions}>
                    {currUserId !== user.id &&
                        this.renderDeleteTeamMember(user.id)}
                </div>
            </div>
        );
    };

    private renderDeleteTeamMember(userId: number) {
        return (
            <div
                className={`${styles.Action} ${styles.Delete}`}
                onClick={this.onDeleteTeamMemberClick(userId)}
            >
                <MaterialIconUI iconStyle={'outlined'}>
                    remove_circle
                </MaterialIconUI>
            </div>
        );
    }

    private renderInvitedUser = (invitation: Invitation, index: number) => {
        return (
            <div key={invitation.id} className={styles.Cell}>
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
                    )}
                </div>
            </div>
        );
    };

    private renderInvitation = (invitation: Invitation, index: number) => {
        return (
            <tr
                key={invitation.id}
                className={`${styles.Row} ${styles.Invitation}`}
            >
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
                        relativeLayout={this.props.deps.relativeLayout}
                    >
                        <div
                            className={`${styles.Action} ${styles.CopyLink}`}
                            onClick={this.onCopyInvitationLinkClick(invitation)}
                        >
                            <MaterialIconUI iconStyle={'outlined'}>
                                link
                            </MaterialIconUI>
                        </div>
                    </TooltipUI>
                    {this.renderDeleteInvitationAction(
                        invitation,
                    )}
                </td>
            </tr>
        );
    };

    private renderDeleteInvitationAction(
        invitation: Invitation,
    ) {
        return (
            <TooltipUI 
                message={'Delete'}
                relativeLayout={this.props.deps.relativeLayout}>
                <div
                    className={`${styles.Action} ${styles.Delete}`}
                    onClick={this.onDeleteInvitationClick(invitation.id)}
                >
                    <MaterialIconUI iconStyle={'outlined'}>
                        remove_circle
                    </MaterialIconUI>
                </div>
            </TooltipUI>
        );
    }

    private onCloseButtonClick = () => {
        closeIfNot(this.onStateChangeChan);
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

    private onDeleteTeamClick = async () => {
        const team = this.state.team!;
        await this.stateSyncer.deleteTeam(team.id);
        this.modalRef.current?.close();
        this.router.navigateTo(teamsRoutePattern);
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

    private onDeleteTeamMemberClick = (userId: number) => {
        return () => {
            this.stateSyncer.removeMemberFromTeam(this.state.team!.id, userId);
        };
    };

    private onDeleteInvitationClick = (invitationId: number) => {
        return () => {
            // TODO: replace with mutation event
            this.stateSyncer.deleteInvitation(invitationId);
        };
    };

    private onMemberBandwidthChange = (
        teamMember: TeamMember,
    ): ((duration?: Duration) => void) => {
        return async (duration?: Duration) => {
            if (duration === undefined) {
                return;
            }

            await this.stateSyncer.updateTeamMember(teamMember.team.id, {
                userId: teamMember.user.id,
                weeklyBandwidth: duration,
            });
        };
    };

    private handleFileUploadFinished = async (fileUploadSessionId: number) => {
        await this.stateSyncer.finishTeamIconUpdateSession(
            this.state.team!.id,
            fileUploadSessionId,
        );
        const team = this.graphSource.team(this.state.team!.id);
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
