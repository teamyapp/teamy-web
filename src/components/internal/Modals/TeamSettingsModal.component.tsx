import moment from 'moment';
import React, {
    Component,
    FormEvent,
    MouseEvent,
    ReactNode,
    createRef,
} from 'react';

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
import { CreateTeamGroupModalComponent } from 'components/pages/Marketplace/Modals/CreateTeamGroupModal.component';
import { CreateTeamMemberGroupModalComponent } from './CreateTeamMemberGroupModal.component';
import { User } from '@core/entity/user';
import { SelectEntityPopupComponent } from '../SelectItemPopupComponent.component';
import classNames from 'classnames';
import styles from './TeamSettingsModal.component.module.scss';
import { UpdateTeamMemberGroupInput } from '@core/entity/input';
import { ConfirmActionsModalComponent } from './ConfirmActionsModal.component';
import { TeamMemberGroup } from '@core/entity/teamMemberGroup';
import { SelectUserListUI } from '../SelectUserList';
import { getUserShortName } from '../format';

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
    selectedGroupMembers: Record<number, Set<number>>;
    selectedGroupInvitations: Record<number, Set<number>>;
    editingTeamMemberGroupInput: Record<
        number,
        UpdateTeamMemberGroupInput | undefined
    >;
    deletingGroupId?: number;
    deletingGroupName?: string;
}

export class TeamSettingsModalComponent extends Component<Props, State> {
    private readonly router: Router;
    private readonly localStore: LocalStore;
    private readonly graphSource: GraphSource;
    private readonly stateSyncer: StateSyncer;
    private readonly relativeLayout: RelativeLayout;

    private readonly modalRef = createRef<ModalUI>();
    private readonly createTeamMemberGroupModelRef =
        createRef<CreateTeamGroupModalComponent>();
    private readonly deleteTeamGroupConfirmRef =
        createRef<ConfirmActionsModalComponent>();
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
            selectedGroupMembers: {},
            selectedGroupInvitations: {},
            editingTeamMemberGroupInput: {},
        };
    }

    public render() {
        return (
            <>
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
                <CreateTeamMemberGroupModalComponent
                    deps={this.props.deps}
                    ref={this.createTeamMemberGroupModelRef}
                />
            </>
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

    private renderTeamMemberGroup = (
        group: TeamMemberGroup,
        teamMemberUsers: User[],
        teamMemberInvitations: Invitation[],
    ) => {
        const groupMemberUserIds = new Set(
            group.members.map((user) => user.id),
        );
        const groupInvitationIds = new Set(
            group.invitations.map((invitation) => invitation.id),
        );
        const availableMemberUsers = teamMemberUsers?.filter(
            (user) => !groupMemberUserIds.has(user.id),
        );
        const availableGroupInvitations = teamMemberInvitations?.filter(
            (invitation) => !groupInvitationIds.has(invitation.id),
        );

        const addUserOrInvitationDisabled =
            !availableMemberUsers?.length && !availableGroupInvitations.length;
        const isEditing = this.state.editingTeamMemberGroupInput[group.id];

        const selectedUsersAndInvitationsSize =
            (this.state.selectedGroupMembers[group.id]?.size || 0) +
            (this.state.selectedGroupInvitations[group.id]?.size || 0);
        const totalUsersAndInvitationsSize =
            group.members.length + group.invitations.length;

        return (
            <div className={styles.MemberGroup} key={group.id}>
                <div className={styles.ToolBar}>
                    <div
                        className={`${styles.NameContainer} ${classNames({
                            [styles.HasAction]: !isEditing,
                        })}`}
                    >
                        <div className={styles.NameInput}>
                            {isEditing ? (
                                <div
                                    className={styles.TextField}
                                    contentEditable
                                    onInput={this.handleTeamMemberGroupNameInput(
                                        group.id,
                                    )}
                                >
                                    {group.name}
                                </div>
                            ) : (
                                <div
                                    className={`${styles.Name} ${classNames({
                                        [styles.HasAction]: group.id,
                                    })}`}
                                    onDoubleClick={this.handleOnTeamMemberGroupNameClick(
                                        group.name,
                                        group.id,
                                    )}
                                >
                                    {group.name}
                                </div>
                            )}
                            {isEditing ? (
                                <>
                                    <TooltipUI
                                        message='Save'
                                        relativeLayout={
                                            this.props.deps.relativeLayout
                                        }
                                    >
                                        <div
                                            className={`${styles.Action} ${styles.Save}`}
                                            onClick={this.handleTeamMemberGroupSave(
                                                group.id,
                                            )}
                                        >
                                            <MaterialIconUI>
                                                check
                                            </MaterialIconUI>
                                        </div>
                                    </TooltipUI>
                                    <TooltipUI
                                        message='Cancel'
                                        relativeLayout={
                                            this.props.deps.relativeLayout
                                        }
                                    >
                                        <div
                                            className={`${styles.Action} ${styles.Cancel}`}
                                            onClick={this.handleTeamMemberGroupCancel(
                                                group.id,
                                            )}
                                        >
                                            <MaterialIconUI>
                                                undo
                                            </MaterialIconUI>
                                        </div>
                                    </TooltipUI>
                                </>
                            ) : (
                                <TooltipUI
                                    message='Edit'
                                    relativeLayout={
                                        this.props.deps.relativeLayout
                                    }
                                >
                                    <div
                                        className={`${styles.Action} ${styles.Edit}`}
                                        onClick={this.handleOnTeamMemberGroupNameClick(
                                            group.name,
                                            group.id,
                                        )}
                                    >
                                        <MaterialIconUI>edit</MaterialIconUI>
                                    </div>
                                </TooltipUI>
                            )}
                        </div>
                    </div>
                    <div className={styles.Label}>
                        <TooltipUI
                            relativeLayout={this.props.deps.relativeLayout}
                            message={'Selected'}
                        >
                            <div className={styles.MemberCount}>
                                {`${selectedUsersAndInvitationsSize} /
                              ${totalUsersAndInvitationsSize}`}
                            </div>
                        </TooltipUI>
                    </div>
                    <div className={styles.Actions}>
                        {
                            <>
                                <TooltipUI
                                    disabled={!selectedUsersAndInvitationsSize}
                                    message='Remove from group'
                                    relativeLayout={
                                        this.props.deps.relativeLayout
                                    }
                                >
                                    <div
                                        className={`${styles.Action} ${styles.Remove} ${classNames(
                                            {
                                                [styles.Disabled]:
                                                    !selectedUsersAndInvitationsSize,
                                            },
                                        )}`}
                                        onClick={this.handleRemoveUserAndInvitationFromGroup(
                                            group.id,
                                        )}
                                    >
                                        <MaterialIconUI>remove</MaterialIconUI>
                                    </div>
                                </TooltipUI>
                                <SelectEntityPopupComponent
                                    relativeLayout={this.relativeLayout}
                                    objectList={(closeContainer) => (
                                        <>
                                            <SelectUserListUI
                                                users={
                                                    availableMemberUsers || []
                                                }
                                                onSelectUser={this.handleAddUserToTeamMemberGroup(
                                                    closeContainer,
                                                    group.id,
                                                )}
                                            />

                                            <>
                                                {availableGroupInvitations.map(
                                                    (invitation) => (
                                                        <div
                                                            className={
                                                                styles.InvitationRow
                                                            }
                                                            key={invitation.id}
                                                            onClick={this.handleInvitationRowClick(
                                                                invitation.id,
                                                                group.id,
                                                            )}
                                                        >
                                                            {this.renderInvitationProfile(
                                                                invitation,
                                                            )}
                                                            <div
                                                                className={
                                                                    styles.Name
                                                                }
                                                            >
                                                                {getUserShortName(
                                                                    invitation.receiverFirstName,
                                                                    invitation.receiverLastName,
                                                                )}
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </>
                                        </>
                                    )}
                                    zOffset={1002}
                                    referenceElement={({
                                        toggleContainer,
                                        showFollower,
                                    }) => (
                                        <TooltipUI
                                            message='Add to group'
                                            relativeLayout={
                                                this.props.deps.relativeLayout
                                            }
                                            disabled={
                                                addUserOrInvitationDisabled ||
                                                showFollower
                                            }
                                        >
                                            <div
                                                className={`${styles.Action} ${styles.Add} ${classNames(
                                                    {
                                                        [styles.Disabled]:
                                                            addUserOrInvitationDisabled,
                                                        [styles.Active]:
                                                            showFollower,
                                                    },
                                                )}`}
                                                onClick={this.handleToggleUserPopup(
                                                    addUserOrInvitationDisabled,
                                                    toggleContainer,
                                                )}
                                            >
                                                <MaterialIconUI>
                                                    add
                                                </MaterialIconUI>
                                            </div>
                                        </TooltipUI>
                                    )}
                                />
                                <TooltipUI
                                    message='Delete group'
                                    relativeLayout={
                                        this.props.deps.relativeLayout
                                    }
                                >
                                    <div
                                        className={`${styles.Action} ${styles.Delete}`}
                                        onClick={this.handleDeleteTeamMemberGroup(
                                            group.id,
                                            group.name,
                                        )}
                                    >
                                        <MaterialIconUI>close</MaterialIconUI>
                                    </div>
                                </TooltipUI>
                                <TooltipUI
                                message='Move up'
                                relativeLayout={this.props.deps.relativeLayout}
                            >
                                <div
                                    className={`${styles.Action} ${styles.MoveUp} ${classNames(
                                        {
                                            [styles.Disabled]: group.orderIndex === 0,
                                        },
                                    )}`}
                                    onClick={this.handleMoveTeamMemberGroupUp(group.id, group.name)}
                                >
                                    <MaterialIconUI>
                                        arrow_upward
                                    </MaterialIconUI>
                                </div>
                            </TooltipUI>

                            <TooltipUI
                                message='Move down'
                                relativeLayout={this.props.deps.relativeLayout}
                            >
                                <div
                                    className={`${styles.Action} ${styles.MoveDown} ${classNames({
                                        [styles.Disabled]:
                                            group.orderIndex ===
                                            (this.state.team?.memberGroups
                                                .length || 1) - 1,
                                    })}`}
                                    onClick={this.handleMoveTeamMemberGroupDown(group.id, group.name)}
                                >
                                    <MaterialIconUI>
                                        arrow_downward
                                    </MaterialIconUI>
                                </div>
                            </TooltipUI>
                            </>
                        }
                    </div>
                </div>
                {(group.members.length > 0 || group.invitations.length > 0) && (
                    <div className={styles.TeamMemberList}>
                        {group.members.map((user) =>
                            this.renderTeamMember(user, group.id),
                        )}
                        {group.invitations.map((invitation) =>
                            this.renderGroupInvitation(invitation, group.id),
                        )}
                    </div>
                )}
            </div>
        );
    };

    private handleInvitationRowClick =
        (invitationId: number, groupId: number) => () => {
            this.props.deps.stateSyncer.addInvitationToTeamMemberGroup(
                invitationId,
                groupId,
            );
        };

    private renderInvitationProfile = (invitation: Invitation) => {
        return (
            <div className={styles.InvitationProfile}>
                {invitation.receiverFirstName
                    ? invitation.receiverFirstName[0]
                    : '?'}
            </div>
        );
    };

    private renderAllTeamMemberGroup = (
        teamMemberUsers: User[],
        teamMemberInvitations: Invitation[],
    ) => {
        return (
            <div className={styles.MemberGroup}>
                <div className={styles.ToolBar}>
                    <div className={styles.NameContainer}>
                        <div className={styles.NameInput}>
                            <div className={styles.Name}>All Members</div>
                        </div>
                    </div>
                    <div className={styles.Label}>
                        <TooltipUI
                            relativeLayout={this.props.deps.relativeLayout}
                            message={'Total'}
                        >
                            <div className={styles.MemberCount}>
                                {teamMemberUsers.length +
                                    teamMemberInvitations.length}
                            </div>
                        </TooltipUI>
                    </div>
                    <div className={styles.Actions}>
                        <TooltipUI
                            message='Invite new user'
                            relativeLayout={this.props.deps.relativeLayout}
                        >
                            <div
                                className={`${styles.Action} ${styles.Add}`}
                                onClick={this.onInvitationClick}
                            >
                                <MaterialIconUI>add</MaterialIconUI>
                            </div>
                        </TooltipUI>
                    </div>
                </div>
                {(teamMemberUsers.length > 0 ||
                    teamMemberInvitations.length > 0) && (
                    <div className={styles.TeamMemberList}>
                        {teamMemberUsers.map((user) =>
                            this.renderTeamMember(user),
                        )}
                        {teamMemberInvitations.map((invitation) =>
                            this.renderGroupInvitation(invitation),
                        )}
                    </div>
                )}
            </div>
        );
    };

    private renderTeamMembersTab = () => {
        const teamMemberGroups = this.state.team?.memberGroups || [];
        const allMemberUsers =
            this.state.team?.members?.map((member) => member.user) || [];
        const allNonAcceptedInvitations = this.state.invitations.filter(
            (invitation) => invitation.status !== 'ACCEPTED',
        );
        return (
            <div className={styles.TeamMembersTab}>
                <div className={styles.TopBar}>
                    <div
                        className={`${styles.Action} ${styles.Add}`}
                        onClick={this.onCreateMemberGroupClick}
                    >
                        Create group
                    </div>
                </div>
                <div className={styles.Scrollable}>
                    {this.renderAllTeamMemberGroup(
                        allMemberUsers,
                        allNonAcceptedInvitations,
                    )}
                    {teamMemberGroups.map((group) => {
                        return this.renderTeamMemberGroup(
                            group,
                            allMemberUsers,
                            allNonAcceptedInvitations,
                        );
                    })}
                </div>
                <ConfirmActionsModalComponent
                    ref={this.deleteTeamGroupConfirmRef}
                    message={`Do you want to delete this team member group ${this.state.deletingGroupName}?`}
                    onConfirm={this.onDeleteTeamMemberGroup}
                />
            </div>
        );
    };

    private renderInvitationsTab = () => {
        const sortedInvitations = orderByStatus(this.state.invitations);
        return (
            <div className={styles.InvitationsTab}>
                <div className={styles.TopBar}>
                    <div
                        className={`${styles.Action} ${styles.Add}`}
                        onClick={this.onInvitationClick}
                    >
                        Invite
                    </div>
                </div>
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

    private renderGroupInvitation = (
        invitation: Invitation,
        groupId?: number,
    ) => {
        return (
            <div
                key={invitation.id}
                className={`${styles.Cell} ${classNames({
                    [styles.HasAction]: groupId,
                    [styles.Active]:
                        groupId &&
                        this.state.selectedGroupInvitations[groupId]?.has(
                            invitation.id,
                        ),
                })}`}
                onClick={this.handleGroupInvitationSelected(
                    invitation.id,
                    groupId,
                )}
            >
                {this.renderInvitationProfile(invitation)}
                <div
                    className={`${styles.InvitationStatus} ${
                        styles[invitation.status]
                    }`}
                >
                    {invitation.status}
                </div>
                <div className={styles.MemberName}>
                    <span>{invitation.receiverFirstName}</span>
                    &nbsp;
                    <span>{invitation.receiverLastName}</span>
                </div>

                {!groupId && (
                    <div className={styles.Actions}>
                        <TooltipUI
                            message='Copy Link'
                            relativeLayout={this.props.deps.relativeLayout}
                        >
                            <div
                                className={`${styles.Action} ${styles.CopyLink}`}
                                onClick={this.onCopyInvitationLinkClick(
                                    invitation,
                                )}
                            >
                                <MaterialIconUI iconStyle={'outlined'}>
                                    link
                                </MaterialIconUI>
                            </div>
                        </TooltipUI>
                        <TooltipUI
                            message='delete invitation'
                            relativeLayout={this.props.deps.relativeLayout}
                        >
                            <div
                                className={`${styles.Action} ${styles.Delete}`}
                                onClick={this.onDeleteInvitationClick(
                                    invitation.id,
                                )}
                            >
                                <MaterialIconUI iconStyle={'outlined'}>
                                    remove_circle
                                </MaterialIconUI>
                            </div>
                        </TooltipUI>
                    </div>
                )}
            </div>
        );
    };

    private renderTeamMember = (user: User, groupId?: number) => {
        const currUserId = this.graphSource.currentUser()!.id;
        return (
            <div
                key={user.id}
                className={`${styles.Cell} ${classNames({
                    [styles.HasAction]: groupId,
                    [styles.Active]:
                        groupId &&
                        this.state.selectedGroupMembers[groupId]?.has(user.id),
                })}`}
                onClick={this.handleGroupUserSelected(user.id, groupId)}
            >
                <UserProfileUI user={user} />
                <div className={styles.UserId}>{user.id}</div>
                <div className={styles.MemberName}>
                    <span>{user.firstName}</span>
                    &nbsp;
                    <span>{user.lastName}</span>
                </div>
                {!groupId && (
                    <div className={styles.Actions}>
                        {currUserId !== user.id &&
                            this.renderDeleteTeamMember(user.id)}
                    </div>
                )}
            </div>
        );
    };

    private renderDeleteTeamMember(userId: number) {
        return (
            <TooltipUI
                message='Remove from team'
                relativeLayout={this.props.deps.relativeLayout}
            >
                <div
                    className={`${styles.Action} ${styles.Delete}`}
                    onClick={this.onDeleteTeamMemberClick(userId)}
                >
                    <MaterialIconUI iconStyle={'outlined'}>
                        remove_circle
                    </MaterialIconUI>
                </div>
            </TooltipUI>
        );
    }

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
                    {this.renderDeleteInvitationAction(invitation)}
                </td>
            </tr>
        );
    };

    private renderDeleteInvitationAction(invitation: Invitation) {
        return (
            <TooltipUI
                message={'Delete'}
                relativeLayout={this.props.deps.relativeLayout}
            >
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

    private handleOnTeamMemberGroupNameClick =
        (name: string, groupId?: number) =>
        (event: MouseEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            if (!groupId) {
                return;
            }

            const editingTeamMemberGroupInput = {
                ...this.state.editingTeamMemberGroupInput,
                [groupId]: {
                    name,
                },
            };

            this.setState({
                editingTeamMemberGroupInput,
            });
        };

    private handleTeamMemberGroupNameInput =
        (groupId: number) => (event: FormEvent<HTMLDivElement>) => {
            const input = this.state.editingTeamMemberGroupInput[groupId];
            if (!input) {
                return;
            }

            this.setState({
                editingTeamMemberGroupInput: {
                    ...this.state.editingTeamMemberGroupInput,
                    [groupId]: {
                        ...input,
                        name: event.currentTarget.textContent || '',
                    },
                },
            });
        };

    private handleTeamMemberGroupSave = (groupId: number) => async () => {
        const input = this.state.editingTeamMemberGroupInput[groupId];
        if (!input) {
            return;
        }

        await this.stateSyncer.updateTeamMemberGroup(groupId, input);
        this.setState({
            editingTeamMemberGroupInput: {
                ...this.state.editingTeamMemberGroupInput,
                [groupId]: undefined,
            },
        });
    };

    private handleTeamMemberGroupCancel = (groupId: number) => () => {
        this.setState({
            editingTeamMemberGroupInput: {
                ...this.state.editingTeamMemberGroupInput,
                [groupId]: undefined,
            },
        });
    };

    private handleMoveTeamMemberGroupUp = (groupId: number, groupName: string) => () => {
        this.stateSyncer.moveUpTeamMemberGroup(groupId);
        this.props.deps.feedbackPubSub.publish({
            type: 'TeamMemberGroupOrderUpdated',
            name: groupName,
            direction: 'moved up',
        });
    };

    private handleMoveTeamMemberGroupDown = (groupId: number, groupName: string) => () => {
        this.stateSyncer.moveDownTeamMemberGroup(groupId);
        this.props.deps.feedbackPubSub.publish({
            type: 'TeamMemberGroupOrderUpdated',
            name: groupName,
            direction: 'moved down',
        });
    };

    private handleAddUserToTeamMemberGroup =
        (closeContainer: () => void, groupId: number) =>
        async (userId: number) => {
            closeContainer();
            await this.stateSyncer.addUserToTeamMemberGroup(groupId, userId);
        };

    private handleDeleteTeamMemberGroup =
        (groupId: number, groupName: string) => () => {
            this.setState(
                {
                    deletingGroupId: groupId,
                    deletingGroupName: groupName,
                },
                () => {
                    this.deleteTeamGroupConfirmRef.current?.open();
                },
            );
        };

    private onDeleteTeamMemberGroup = async () => {
        const groupId = this.state.deletingGroupId;
        if (!groupId) {
            return;
        }

        await this.stateSyncer.deleteTeamMemberGroup(groupId);
        this.setState({
            deletingGroupId: undefined,
            deletingGroupName: undefined,
        });
    };

    private handleToggleUserPopup =
        (disabled: boolean, toggleContainer: () => void) =>
        (event: MouseEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            if (disabled) {
                return;
            }

            toggleContainer();
        };

    private handleRemoveUserAndInvitationFromGroup =
        (groupId: number) => async () => {
            const selectedGroupMembers =
                this.state.selectedGroupMembers[groupId];
            const selectedGroupInvitations =
                this.state.selectedGroupInvitations[groupId];

            if (!selectedGroupMembers && !selectedGroupInvitations) {
                return;
            }

            selectedGroupMembers?.forEach(async (userId) => {
                await this.stateSyncer.removeUserFromTeamMemberGroup(
                    groupId,
                    userId,
                );
            });

            selectedGroupInvitations?.forEach(async (invitationId) => {
                await this.stateSyncer.removeInvitationFromTeamMemberGroup(
                    invitationId,
                    groupId,
                );
            });

            this.setState({
                selectedGroupMembers: {
                    ...this.state.selectedGroupMembers,
                    [groupId]: new Set(),
                },
                selectedGroupInvitations: {
                    ...this.state.selectedGroupInvitations,
                    [groupId]: new Set(),
                },
            });
        };

    private handleGroupInvitationSelected =
        (invitationId: number, groupId?: number) => () => {
            if (!groupId) {
                return;
            }

            const selectedGroupInvitations = {
                ...this.state.selectedGroupInvitations,
            };
            if (!selectedGroupInvitations[groupId]) {
                selectedGroupInvitations[groupId] = new Set();
            }

            if (selectedGroupInvitations[groupId].has(invitationId)) {
                selectedGroupInvitations[groupId].delete(invitationId);
            } else {
                selectedGroupInvitations[groupId].add(invitationId);
            }

            this.setState({
                selectedGroupInvitations,
            });
        };

    private handleGroupUserSelected =
        (userId: number, groupId?: number) => () => {
            if (!groupId) {
                return;
            }

            const selectedGroupMembers = { ...this.state.selectedGroupMembers };
            if (!selectedGroupMembers[groupId]) {
                selectedGroupMembers[groupId] = new Set();
            }

            if (selectedGroupMembers[groupId].has(userId)) {
                selectedGroupMembers[groupId].delete(userId);
            } else {
                selectedGroupMembers[groupId].add(userId);
            }

            this.setState({
                selectedGroupMembers,
            });
        };

    private onCloseButtonClick = () => {
        closeIfNot(this.onStateChangeChan);
        this.modalRef.current?.close();
    };

    private onInvitationClick = async () => {
        await this.props.onAddTeamMemberClick?.call(null, this.state.team!.id);
    };

    private onTabClick = (tabIndex: number) => {
        this.setState({
            currentTabIndex: tabIndex,
        });
    };

    private onCreateMemberGroupClick = () => {
        this.createTeamMemberGroupModelRef.current?.open();
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
