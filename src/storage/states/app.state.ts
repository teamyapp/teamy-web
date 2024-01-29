import { ClientState } from '@core/storage/states/client.state';
import { InvitationState } from '@core/storage/states/invitation.state';
import { MessageState } from '@core/storage/states/message.state';
import { SprintState } from '@core/storage/states/sprint.state';
import { SprintParticipantState } from '@core/storage/states/sprintParticipant.state';
import { SprintTaskRelationState } from '@core/storage/states/sprintTaskRelation.state';
import { TaskState } from '@core/storage/states/task.state';
import { TaskActivityState } from '@core/storage/states/taskActivity.state';
import { TaskAwaitForRelationState } from '@core/storage/states/taskAwaitForRelation.state';
import { TeamState } from '@core/storage/states/team.state';
import { TeamMemberState } from '@core/storage/states/teamMember.state';
import { ThirdPartyAppState } from '@core/storage/states/thirdPartyApp.state';
import { UserState } from '@core/storage/states/user.state';
import { UserLinkState } from '@core/storage/states/userLink.state';

import { AppInstallationState } from './appInstallation.state';
import { AppSecretState } from './appSecret.state';
import { TaskLinkState } from './taskLink.state';
import { TeamAppVersionState } from './teamAppVersion.state';
import { TagState } from './tag.state';
import { FilterGroupState, GroupState } from './group.state';
import { ActivatorState, MaxViewersActivatorState, PercentageActivatorState, TimeRangeActivatorState } from './activator.state';
import { ExperimentVersionSelectorState, StaticVersionSelectorState, VersionSelectorState } from './versionSelector.state';
import { RolloutState } from './rollout.state';
import { MemberGroupRelationState } from './memberGroupRelation.state';


interface StateParams {
    teamSelectedSprint: Record<number, number>,
    currUserId?: number;
    currTeamId?: number;
    currSprintId?: number;
    currClientId?: number;
} 


export class AppState {
    public readonly apps: Record<number, ThirdPartyAppState> = {};
    public readonly appSecrets: Record<number, AppSecretState> = {};
    public readonly appInstallations: Record<number, AppInstallationState> = {};
    public readonly tags: Record<number, TagState> = {};
    public readonly groups: Record<number, GroupState> = {};
    public readonly filterGroups: Record<number, FilterGroupState> = {};
    public readonly activators: Record<number, ActivatorState> = {};
    public readonly maxViewersActivators: Record<number, MaxViewersActivatorState> = {};
    public readonly percentageActivators: Record<number, PercentageActivatorState> = {};
    public readonly timeRangeActivators: Record<number, TimeRangeActivatorState> = {};
    public readonly versionSelectors: Record<number, VersionSelectorState> = {};
    public readonly staticVersionSelectors: Record<number, StaticVersionSelectorState> = {};
    public readonly experimentVersionSelectors: Record<number, ExperimentVersionSelectorState> = {};
    public readonly rollouts: Record<number, RolloutState> = {};
    public readonly users: Record<number, UserState> = {};
    public readonly clients: Record<number, ClientState> = {};
    public readonly teams: Record<number, TeamState> = {};
    public readonly tasks: Record<number, TaskState> = {};
    public readonly taskLinks: Record<number, TaskLinkState> = {};
    public readonly messages: Record<number, MessageState> = {};
    public readonly invitations: Record<number, InvitationState> = {};
    public readonly sprints: Record<number, SprintState> = {};
    public readonly teamSelectedSprint: Record<number, number> = {};
    public readonly teamMembers: TeamMemberState[] = [];
    public readonly taskAwaitForRelations: TaskAwaitForRelationState[] = [];
    public readonly userLinks: UserLinkState[] = [];
    public readonly sprintTaskRelations: SprintTaskRelationState[] = []; 
    public readonly sprintParticipants: SprintParticipantState[] = [];

    public readonly taskActivities: TaskActivityState[] = [];
    public readonly teamAppVersions: TeamAppVersionState[] = [];
    public readonly userGroupRelations: MemberGroupRelationState[] = [];
    public readonly teamGroupRelations: MemberGroupRelationState[] = [];
    public readonly currUserId?: number;
    public readonly currTeamId?: number;
    public readonly currSprintId?: number;
    public readonly currClientId?: number;
    public readonly activeSprintTabIndex?: number;
    public readonly fetchedMeData?: boolean;
    public readonly fetchedTeamData?: boolean;


    constructor(state: StateParams = {
        teamSelectedSprint: {},
        currUserId: undefined,
        currTeamId: undefined,
        currSprintId: undefined,
        currClientId: undefined,
    }) {
        this.currUserId = state.currUserId;
        this.currTeamId = state.currTeamId;
        this.currSprintId = state.currSprintId;
        this.currClientId = state.currClientId;
        this.teamSelectedSprint = state.teamSelectedSprint;
    }



    public static fromJson(json: any): AppState {
        return new AppState({
            currClientId: json.currClientId,
            currSprintId: json.currSprintId,
            currTeamId: json.currTeamId,
            currUserId: json.currUserId,
            teamSelectedSprint: json.teamSelectedSprint,
            

           
        });
    }
}
