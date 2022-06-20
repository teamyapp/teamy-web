import { PopChannel, chan, multi } from '@lib/csp/csp';
import { RealTimeCollectionClient } from '@lib/storage/RealTimeCollection.client';

import { TaskAwaitForRelation } from '@core/statev2/taskAwaitForRelation';

const collectionType = 'TaskAwaitForRelation';

interface DeleteTaskAwaitForRelation {
    teamId: number;
    userId: number;
}

export class TaskAwaitForRelationCollection {
    private readonly createTaskAwaitForRelationCh =
        chan<TaskAwaitForRelation>();
    private readonly createTaskAwaitForRelationMulti = multi(
        this.createTaskAwaitForRelationCh,
    );
    private readonly updateTaskAwaitForRelationCh =
        chan<TaskAwaitForRelation>();
    private readonly updateTaskAwaitForRelationMulti = multi(
        this.updateTaskAwaitForRelationCh,
    );
    private readonly deleteTaskAwaitForRelationCh =
        chan<DeleteTaskAwaitForRelation>();
    private readonly deleteTaskAwaitForRelationMulti = multi(
        this.deleteTaskAwaitForRelationCh,
    );

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
                        this.createTaskAwaitForRelationCh
                            .put(
                                TaskAwaitForRelation.fromAttributes(
                                    mutation.attributes,
                                ),
                            )
                            .then();
                        break;
                    }
                    case 'UPDATE': {
                        this.updateTaskAwaitForRelationCh
                            .put(
                                TaskAwaitForRelation.fromAttributes(
                                    mutation.attributes,
                                ),
                            )
                            .then();
                        break;
                    }
                    case 'DELETE': {
                        this.deleteTaskAwaitForRelationCh
                            .put({
                                teamId: parseInt(mutation.attributes.TeamID),
                                userId: parseInt(mutation.attributes.UserID),
                            })
                            .then();
                        break;
                    }
                }
            }
        })();
    }

    subscribeCreateTaskAwaitForRelation(): PopChannel<
        TaskAwaitForRelation | undefined
    > {
        return this.createTaskAwaitForRelationMulti.copy();
    }

    subscribeUpdateTaskAwaitForRelation(): PopChannel<
        TaskAwaitForRelation | undefined
    > {
        return this.updateTaskAwaitForRelationMulti.copy();
    }

    subscribeDeleteTaskAwaitForRelation(): PopChannel<
        DeleteTaskAwaitForRelation | undefined
    > {
        return this.deleteTaskAwaitForRelationMulti.copy();
    }
}
