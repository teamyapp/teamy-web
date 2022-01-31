import * as csp from '@lib/csp/csp';
import { LocalStore } from '@lib/store/localStore';

import { MutationEvent } from '@core/event/mutation';
import { TaskService } from '@core/service/task.service';
import { TeamService } from '@core/service/team.service';
import { IAppState } from '@core/state/state';

import { PageService } from './page.service';

export class NetworkStateSynchronizer {
    private readonly localStore: LocalStore<IAppState, MutationEvent>;
    private readonly pageService: PageService;

    constructor(
        localStore: LocalStore<IAppState, MutationEvent>,
        taskService: TaskService,
        teamService: TeamService,
        pageService: PageService,
    ) {
        this.localStore = localStore;
        this.pageService = pageService;

        // starts a coroutine that listen to mutationChan forever
        (async () => {
            // query the backend for the first time, to init the state
            // from the backend
            // todo:
            // it is possible for the user the lost their local data
            // if local data contains more data than the server
            // we don't have a merge algorithm yet
            console.log('start NetworkStateSynchronizer coroutine');
            let mutationChan = localStore.subscribeMutationEvent();
            while (true) {
                console.log('wait for local store mutation events');
                let event = await mutationChan.pop();
                if (event === undefined || mutationChan.closed()) {
                    return;
                }
                console.log('handling', event.type, 'for network');
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
                    case 'RemoveTaskOwner':
                        await taskService.removeTaskOwner(event.taskId);
                        break;
                    case 'UpdateActiveTeam':
                        await teamService.updateActiveTeamId(event.teamId);
                        break;
                    case 'CreateTeam':
                        await teamService.createTeam(event.team);
                        break;
                    default:
                        console.log(
                            'NetworkStateSynchronizer does not handle',
                            event,
                        );
                        // continue the loop because we don't care about this event
                        continue;
                }

                // after this mutation event is handled, check if the mutation channel is empty
                // if empty, then do a refresh
                if (!(await isEmpty(mutationChan))) {
                    // more events pending, do not query the backend
                    continue;
                }
                // query the backend for the newest state
                let data = await pageService.fetchMePage('network-only');
                if (!(await isEmpty(mutationChan))) {
                    // more events have happend during the query,
                    // discard the result
                    continue;
                }
                // the localstore state
                console.log('set local store', data);
                this.setState(data);
            }
        })();
    }

    public async syncState() {
        const data = await this.pageService.fetchMePage('network-only');
        this.setState(data);
    }

    private setState(data: any) {
        this.localStore.setState((state) => {
            return Object.assign<any, IAppState, Partial<IAppState>>(
                {},
                state,
                {
                    currentUser: data.me,
                    teams: data.me?.teams,
                    activeTeamId: data.me?.activeTeam?.id,
                    needAttentionTask:
                        data.me?.activeTeam?.tasksNeedAttention[0],
                    teamTasks: data.me?.activeTeam?.tasks,
                },
            );
        });
    }
}

async function isEmpty(channel: csp.BaseChannel): Promise<boolean> {
    const result = await Promise.any([channel.ready(), Promise.resolve(null)]);
    return result === null;
}
