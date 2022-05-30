import { DragAndDropController } from '@lib/dragAndDrop/DragAndDropController';
import { IdentityClient } from '@lib/identity/Identity.client';
import { GraphQLClient } from '@lib/network/GraphQL.client';
import { PubSub } from '@lib/pubSub/pubSub';
import { Router, createBrowserRouter } from '@lib/router/router';
import { ShortcutMonitor } from '@lib/shortcut/monitor';

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
    const teamyGraphQLV2Client = new GraphQLClient(
        identityClient,
        config.teamyGraphQLV2Endpoint,
    );
    const userClient = new UserClient(teamyGraphQLV2Client);
    const taskClient = new TaskClient(teamyGraphQLV2Client);
    const teamClient = new TeamClient(teamyGraphQLV2Client);
    const graphSource = new GraphSource(userClient, taskClient, teamClient);
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
