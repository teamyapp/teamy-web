import { PopChannel, chan, multi } from '@lib/csp/csp';
import { RealTimeCollectionClient } from '@lib/storage/RealTimeCollection.client';

import { Task } from '@core/statev2/task';

const collectionType = 'Task';

export class TaskCollection {
    private readonly createTaskCh = chan<Task>();
    private readonly createTaskMulti = multi(this.createTaskCh);
    private readonly updateTaskCh = chan<Task>();
    private readonly updateTaskMulti = multi(this.updateTaskCh);
    private readonly deleteTaskCh = chan<number>();
    private readonly deleteTaskMulti = multi(this.deleteTaskCh);

    constructor(
        private readonly realTimeCollectionClient: RealTimeCollectionClient,
    ) {}

    sync() {
        const mutationsCh = this.realTimeCollectionClient.subscribeMutations();
        (async () => {
            while (true) {
                const mutation = await mutationsCh.pop();
                if (mutation === undefined) {
                    return;
                }

                if (mutation.collectionType !== collectionType) {
                    continue;
                }

                switch (mutation.mutationType) {
                    case 'CREATE': {
                        this.createTaskCh
                            .put(Task.fromAttributes(mutation.attributes))
                            .then();
                        break;
                    }
                    case 'UPDATE': {
                        this.updateTaskCh
                            .put(Task.fromAttributes(mutation.attributes))
                            .then();
                        break;
                    }
                    case 'DELETE': {
                        this.deleteTaskCh
                            .put(parseInt(mutation.attributes.ID))
                            .then();
                        break;
                    }
                }
            }
        })();
    }

    subscribeCreateTask(): PopChannel<Task | undefined> {
        return this.createTaskMulti.copy();
    }

    subscribeUpdateTask(): PopChannel<Task | undefined> {
        return this.updateTaskMulti.copy();
    }

    subscribeDeleteTask(): PopChannel<number | undefined> {
        return this.deleteTaskMulti.copy();
    }
}
