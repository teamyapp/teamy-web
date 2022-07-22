import { InvitationState } from '@core/storage/states/invitation.state';
import { MessageState } from '@core/storage/states/message.state';
import { SprintState } from '@core/storage/states/sprint.state';
import { SprintTaskRelationState } from '@core/storage/states/sprintTaskRelation.state';
import { TaskState } from '@core/storage/states/task.state';
import { TaskAwaitForRelationState } from '@core/storage/states/taskAwaitForRelation.state';
import { TeamState } from '@core/storage/states/team.state';
import { TeamMemberState } from '@core/storage/states/teamMember.state';
import { UserState } from '@core/storage/states/user.state';
import { UserLinkState } from '@core/storage/states/userLink.state';

export class AppState {
    public constructor(
        public users: Record<number, UserState>,
        public teams: Record<number, TeamState>,
        public tasks: Record<number, TaskState>,
        public messages: Record<number, MessageState>,
        public invitations: Record<number, InvitationState>,
        public sprints: Record<number, SprintState>,
        public teamMembers: TeamMemberState[],
        public taskAwaitForRelations: TaskAwaitForRelationState[],
        public userLinks: UserLinkState[],
        public sprintTaskRelations: SprintTaskRelationState[],
        public teamSelectedSprint: Record<number, number>,
        public currUserId?: number,
        public currTeamId?: number,
        public currSprintId?: number,
    ) {}

    public static fromJson(json: any): AppState {
        return new AppState(
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
            json.teamSelectedSprint || {},
            json.currUserId,
            json.currTeamId,
            json.currSprintId,
        );
    }
}
