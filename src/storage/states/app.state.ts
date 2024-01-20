import { ThirdPartyAppState } from '@core/storage/states/thirdPartyApp.state';
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
import { UserState } from '@core/storage/states/user.state';
import { UserLinkState } from '@core/storage/states/userLink.state';

import { TaskLinkState } from './taskLink.state';
import { AppInstallationState } from './appInstallation.state';
import { AppSecretState } from './appSecret.state';
import { TeamAppVersionState } from './teamAppVersion.state';

export class AppState {
    public constructor(
        public apps: Record<number, ThirdPartyAppState>,
        public appSecrets: Record<number, AppSecretState>,
        public appInstallations: Record<number, AppInstallationState>,
        public users: Record<number, UserState>,
        public clients: Record<number, ClientState>,
        public teams: Record<number, TeamState>,
        public tasks: Record<number, TaskState>,
        public taskLinks: Record<number, TaskLinkState>,
        public messages: Record<number, MessageState>,
        public invitations: Record<number, InvitationState>,
        public sprints: Record<number, SprintState>,
        public teamMembers: TeamMemberState[],
        public taskAwaitForRelations: TaskAwaitForRelationState[],
        public userLinks: UserLinkState[],
        public sprintTaskRelations: SprintTaskRelationState[],
        public sprintParticipants: SprintParticipantState[],
        public teamSelectedSprint: Record<number, number>,
        public taskActivities: TaskActivityState[],
        public teamAppVersions: TeamAppVersionState[],
        public currUserId?: number,
        public currTeamId?: number,
        public currSprintId?: number,
        public currClientId?: number,
        public activeSprintTabIndex?: number,
        public fetchedMeData?: boolean,
        public fetchedTeamData?: boolean,
        public sprintTabReady?: boolean,
    ) {}

    public static fromJson(json: any): AppState {
        return new AppState(
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            [],
            [],
            [],
            [],
            [],
            json.teamSelectedSprint || {},
            [],
            [],
            json.currUserId,
            json.currTeamId,
            json.currSprintId,
            json.clientId,
        );
    }
}
