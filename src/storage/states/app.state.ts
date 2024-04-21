import moment from 'moment';

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

import {
    ActivatorState,
    MaxViewersActivatorState,
    PercentageActivatorState,
    TimeRangeActivatorState,
} from './activator.state';
import { AppGroupRelationState } from './appGroupRelation.state';
import { AppInstallationState } from './appInstallation.state';
import { AppRolloutRelationState } from './appRolloutRelation.state';
import { AppSecretState } from './appSecret.state';
import { AppVersionChangeState } from './appVersionChange.state';
import { AppVersionPriceState } from './appVersionPrice.state';
import { FilterGroupState, GroupState } from './group.state';
import { GroupMemberRelationState } from './groupMemberRelation.state';
import { PhaseState } from './phase.state';
import { PhaseStoryRelationState } from './phaseStoryRelation.state';
import { ProjectState } from './project.state';
import { ProjectPhaseRelationState } from './projectPhaseRelation.state';
import { ProjectStoryRelationState } from './projectStoryRelation.state';
import { RolloutState } from './rollout.state';
import { StoryState } from './story.state';
import { StoryTaskRelationState } from './storyTaskRelation.state';
import { TagState } from './tag.state';
import { TaskLinkState } from './taskLink.state';
import { TeamAppVersionState } from './teamAppVersion.state';
import {
    VersionSelectorState,
    VersionSelectorVersionRelationState,
} from './versionSelector.state';

interface PersistedState {
    teamSelectedSprint: Record<number, number>;
    currUserId?: number;
    currTeamId?: number;
    currSprintId?: number;
    currClientId?: number;
}

export class AppState {
    public apps: Record<number, ThirdPartyAppState> = {};
    public appSecrets: Record<number, AppSecretState> = {};
    public appInstallations: Record<number, AppInstallationState> = {};
    public tags: Record<number, TagState> = {};
    public groups: Record<number, GroupState> = {};
    public filterGroups: Record<number, FilterGroupState> = {};
    public activators: Record<number, ActivatorState> = {};
    public maxViewersActivators: Record<number, MaxViewersActivatorState> = {};
    public percentageActivators: Record<number, PercentageActivatorState> = {};
    public timeRangeActivators: Record<number, TimeRangeActivatorState> = {};
    public versionSelectors: Record<number, VersionSelectorState> = {};
    public rollouts: Record<number, RolloutState> = {};
    public users: Record<number, UserState> = {};
    public clients: Record<number, ClientState> = {};
    public teams: Record<number, TeamState> = {};
    public tasks: Record<number, TaskState> = {};
    public taskLinks: Record<number, TaskLinkState> = {};
    public messages: Record<number, MessageState> = {};
    public invitations: Record<number, InvitationState> = {};
    public sprints: Record<number, SprintState> = {};
    public teamSelectedSprint: Record<number, number> = {};
    public stories: Record<number, StoryState> = {};
    public phases: Record<number, PhaseState> = {};
    public projects: Record<number, ProjectState> = {};
    public projectPhaseRelations: ProjectPhaseRelationState[] = [];
    public projectStoryRelations: ProjectStoryRelationState[] = [];
    public phaseStoryRelations: PhaseStoryRelationState[] = [];
    public storyTaskRelations: StoryTaskRelationState[] = [];
    public teamMembers: TeamMemberState[] = [];
    public taskAwaitForRelations: TaskAwaitForRelationState[] = [];
    public appVersionPrices: AppVersionPriceState[] = [];
    public appVersionChanges: Record<number, AppVersionChangeState> = {};
    public userLinks: UserLinkState[] = [];
    public sprintTaskRelations: SprintTaskRelationState[] = [];
    public sprintParticipants: SprintParticipantState[] = [];
    public taskActivities: TaskActivityState[] = [];
    public teamAppVersions: TeamAppVersionState[] = [];
    public groupMemberRelations: GroupMemberRelationState[] = [];
    public appGroupRelations: AppGroupRelationState[] = [];
    public groupRolloutRelations: GroupRolloutRelationState[] = [];
    public versionSelectorVersionRelations: VersionSelectorVersionRelationState[] =
        [];
    public appRolloutRelations: AppRolloutRelationState[] = [];
    public currUserId?: number;
    public currTeamId?: number;
    public currSprintId?: number;
    public currClientId?: number;
    public activeSprintTabIndex?: number;
    public fetchedMeData?: boolean;
    public fetchedTeamData?: boolean;
    public sprintTabReady?: boolean;

    constructor(
        state: PersistedState = {
            teamSelectedSprint: {},
            currUserId: undefined,
            currTeamId: undefined,
            currSprintId: undefined,
            currClientId: undefined,
        },
    ) {
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
