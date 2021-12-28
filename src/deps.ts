import { getConfig } from '@config/config';
import { getEnvironment } from '@env/environment';
import { IdentityClient } from '@identity/Identity.client';
import { GraphQLClient } from '@network/GraphQL.client';
import { FetchHTTPClient } from '@network/FetchHTTP.client';
import { CommentService } from '@service/comment.service';
import { StatusService } from '@service/status.service';
import { TaskService } from '@service/task.service';
import { TeamService } from '@service/team.service';
import { UserService } from '@service/user.service';

export interface Deps {
    taskService: TaskService;
    teamService: TeamService;
    userService: UserService;
    commentService: CommentService;
    statusService: StatusService;
    identityClient: IdentityClient;
    graphql: GraphQLClient;
}

export function initDeps(): Deps {
    const env = getEnvironment();
    let httpClient = new FetchHTTPClient();
    const identityClient = new IdentityClient(env, httpClient);
    const config = getConfig(env);
    const teamyGraphQLClient = new GraphQLClient(
        identityClient,
        config.teamyGraphQLEndpoint,
    );
    const taskService = new TaskService(teamyGraphQLClient);
    const teamService = new TeamService(teamyGraphQLClient);
    const userService = new UserService(teamyGraphQLClient);
    const statusService = new StatusService(teamyGraphQLClient);
    const commentService = new CommentService(teamyGraphQLClient);
    return {
        taskService,
        teamService,
        userService,
        commentService,
        statusService,
        identityClient,
        graphql: teamyGraphQLClient,
    };
}
