import { MutationEvent } from '@core/entity/events';
import * as csp from "../libs/csp/csp";
import { TaskService } from '@core/service/task.service';
import { PageService } from './page.service';
import { LocalStore } from '@lib/store/localStore';
import { IAppState } from '@core/state/state';

// export function createNetworkStateMutator(
//     taskService: TaskService,
// ): (event: MutationEvent) => Promise<void> {
//     return async (event: MutationEvent) => {

//     };
// }


export class NetworkStateSynchronizer {

    constructor(
        localStore: LocalStore<IAppState, MutationEvent>,
        taskService: TaskService,
        pageService: PageService
    ) {
        // starts a coroutine that listen to mutationChan forever
        (async () => {
            let mutationChan = localStore.subscribeMutationEvent();
            while(true) {
                let event = await mutationChan.pop();
                if (event === undefined || mutationChan.closed()) {
                    return;
                }
                console.log("handling", event.type, "for network");
                switch (event.type) {
                    case 'CreateTask':
                        await taskService.createTask(event.task, event.teamId);
                        break;
                    case 'UpdateTask':
                        await taskService.updateTask(event.task);
                        break;
                    case 'DeleteTask':
                        await taskService.deleteTask(event.taskId);
                        break;
                    case 'StartTask':
                        await taskService.startTask(event.taskId);
                        break;
                    case 'CompleteTask':
                        await taskService.completeTask(event.taskId);
                        break;
                    default:
                        console.log("NetworkStateSynchronizer does not handle", event);
                        // continue the loop because we don't care about this event
                        continue;
                }

                // after this mutation event is handled, check if the mutation channel is empty
                // if empty, then do a refresh
                if(!await isEmpty(mutationChan)) {
                    // more events pending, do not query the backend
                    continue;
                }
                // query the backend for the newest state
                let data = await pageService.fetchMePage('network-only')
                if(!await isEmpty(mutationChan)) {
                    // more events have happend during the query,
                    // discard the result
                    continue;
                }
                // the localstore state
                localStore.setState((state) => {
                    state.activeTeamId = data.me.activeTeam.id;
                    state.needAttentionTask = data.me.activeTeam.tasksNeedAttention;
                    state.teamTasks =  data.me.activeTeam.tasks;
                    return state;
                });
            }
        })();
    }
}

async function isEmpty(channel: csp.BaseChannel): Promise<boolean> {
    const result = await Promise.any([channel.ready(), Promise.resolve(null)]);
    return result === null;
}