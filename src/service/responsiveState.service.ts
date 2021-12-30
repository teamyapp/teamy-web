import * as csp from '@creatcodebuild/csp';
import { Channel, PopChannel } from '@creatcodebuild/csp';
import { Event } from '@lib/event/event';
import { LocalStore } from '@lib/store/localStore';

export interface IStateSyncer {
    fetchNetworkState(): Promise<any>;

    setLocalState(state: any): void;

    syncLocalState(): void;
}

export type MutateNetworkState<MutationEvent> = (
    event: MutationEvent,
) => Promise<void>;

export class ResponsiveStateService<LocalState, MutationEvent extends Event> {
    private readonly networkMutationEventChan = csp.chan<MutationEvent>();
    private readonly localStore: LocalStore<LocalState, MutationEvent>;
    private readonly mutateNetworkState: MutateNetworkState<MutationEvent>;

    constructor(
        localStore: LocalStore<LocalState, MutationEvent>,
        mutateNetworkState: MutateNetworkState<MutationEvent>,
    ) {
        this.localStore = localStore;
        this.mutateNetworkState = mutateNetworkState;
    }

    public listen(
        stateSyncer: IStateSyncer,
        mutationChan: PopChannel<MutationEvent | undefined>,
    ) {
        // move all elements from array1 which meet the given condition into array2
        // creating 2 new arrays
        this.syncNetworkStateInBackground(stateSyncer);

        // synchronized part of mutation listener
        (async () => {
            while (true) {
                const event = await mutationChan.pop();
                if (event === undefined) {
                    return;
                }
                this.localStore.mutate(event);
                stateSyncer.syncLocalState();
                // after synchronized updates, do async network refresh
                // do not await
                this.networkMutationEventChan.put(event);
            }
        })();
    }

    private async syncNetworkStateInBackground(stateSyncer: IStateSyncer) {
        // this coroutine handles network refresh only
        // and each refresh takes place in order

        while (true) {
            // check if the channel is empty.
            // because csp.Channel does not expose the internal buffer
            // nor expose a public isEmpty / length method,
            // to check if the channel is empty, it means to check if the channel is not ready to be consumed.
            // TODO: consider adding synchronized versions of these methods
            if (await isEmpty(this.networkMutationEventChan)) {
                // the channel is not ready therefore empty
                console.log('mutation channel is empty');
                console.log('refresh start');
                const state = await stateSyncer.fetchNetworkState();
                if (await isEmpty(this.networkMutationEventChan)) {
                    stateSyncer.setLocalState(state);
                    console.log('refresh done');
                } else {
                    console.log(
                        'refresh discarded because new mutations happened in the mean time',
                    );
                }
            } else {
                console.log('mutation channel is not empty');
            }
            const event = await this.networkMutationEventChan.pop();
            if (event === undefined) {
                return;
            }
            await this.mutateNetworkState(event);
            console.log(event.type, 'done');
        }
    }
}

async function isEmpty(channel: Channel<any>): Promise<boolean> {
    const result = await Promise.any([channel.ready(), Promise.resolve(null)]);
    return result === null;
}
