import { DragAndDropController } from '@lib/dragAndDrop/DragAndDropController';
import { IdentityClient } from '@lib/identity/Identity.client';
import { GraphQLClient } from '@lib/network/GraphQL.client';
import { PubSub } from '@lib/pubSub/pubSub';
import { Router, createBrowserRouter } from '@lib/router/router';
import { ShortcutMonitor } from '@lib/shortcut/monitor';

import { InvitationClient } from '@core/client/invitation.client';
import { MessageClient } from '@core/client/message.client';
import { TaskClient } from '@core/client/task.client';
import { TeamClient } from '@core/client/team.client';
import { UserClient } from '@core/client/user.client';
import { getConfig } from '@core/config/config';
import { absoluteRootPath, signInFinishPath } from '@core/config/routing';
import { shortcuts } from '@core/config/shortcut';
import { Feedback } from '@core/entity/feedback';
import { getEnvironment } from '@core/env/environment';
import { UserActionEvent } from '@core/event/userAction';
import { GraphSource } from '@core/graph/graphSource';

export interface Deps {
    graphSource: GraphSource;
    identityClient: IdentityClient;
    router: Router;
    shortcutMonitor: ShortcutMonitor<UserActionEvent>;
    dragAndDropController: DragAndDropController;
    feedbackPubSub: PubSub<Feedback>;
}

export function initDeps(): Deps {
    const env = getEnvironment();
    const identityClient = new IdentityClient(
        env,
        signInFinishPath,
        absoluteRootPath,
    );
    const config = getConfig(env);
    const teamyGraphQLClient = new GraphQLClient(
        identityClient,
        config.teamyGraphQLEndpoint,
    );
    const userClient = new UserClient(teamyGraphQLClient);
    const taskClient = new TaskClient(teamyGraphQLClient);
    const teamClient = new TeamClient(teamyGraphQLClient);
    const invitationClient = new InvitationClient(teamyGraphQLClient);
    const messageClient = new MessageClient(teamyGraphQLClient);
    const graphSource = new GraphSource(
        userClient,
        taskClient,
        teamClient,
        invitationClient,
        messageClient,
    );
    const router = createBrowserRouter();
    const shortcutMonitor = new ShortcutMonitor(shortcuts);
    const dragAndDropController = new DragAndDropController();
    const feedbackPubSub = new PubSub<Feedback>();
    return {
        graphSource,
        identityClient,
        router,
        shortcutMonitor,
        dragAndDropController,
        feedbackPubSub,
    };
}
