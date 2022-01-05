import * as csp from '@lib/csp/csp';
import { Channel, PopChannel } from '@lib/csp/csp';
import { Event } from '@lib/event/event';
import { LocalStore } from '@lib/store/localStore';

// export interface IStateSyncer<State> {
//     fetchNetworkState(): Promise<any>;

//     updateLocalStateWithRawData(data: any): Promise<void>;

//     updateLocalState(state: State): void;
// }

// export type MutateNetworkState<MutationEvent> = (
//     event: MutationEvent,
// ) => Promise<void>;

// export class ResponsiveStateService<LocalState, MutationEvent extends Event> {
//     private readonly networkMutationEventChan = csp.chan<MutationEvent>();
//     private readonly localStore: LocalStore<LocalState, MutationEvent>;
//     private readonly mutateNetworkState: MutateNetworkState<MutationEvent>;

//     constructor(
//         localStore: LocalStore<LocalState, MutationEvent>,
//         mutateNetworkState: MutateNetworkState<MutationEvent>,
//     ) {
//         console.log("constructing ResponsiveStateService");
//         this.localStore = localStore;
//         this.mutateNetworkState = mutateNetworkState;
//     }

//     public listen(
//         // stateSyncer: IStateSyncer<LocalState>,
//         mutationChan: PopChannel<MutationEvent | undefined>,
//     ) {
//         // move all elements from array1 which meet the given condition into array2
//         // creating 2 new arrays
//         // this.syncNetworkStateInBackground(stateSyncer);

//         // synchronized part of mutation listener
//         (async () => {
//             while (true) {
//                 console.log("wait for mutationChan");
//                 const event = await mutationChan.pop();
//                 if (event === undefined) {
//                     return;
//                 }
//                 const state = this.localStore.mutate(event);
//                 // stateSyncer.updateLocalState(state);
//                 // after synchronized updates, do async network refresh
//                 // do not await
//                 this.networkMutationEventChan.put(event);
//             }
//         })();
//     }

//     private async syncNetworkStateInBackground(
//         stateSyncer: IStateSyncer<LocalState>,
//     ) {
//         // this coroutine handles network refresh only
//         // and each refresh takes place in order

//         while (true) {
//             if (await isEmpty(this.networkMutationEventChan)) {
//                 console.log('mutation channel is empty');
//                 console.log('refresh start');
//                 const data = await stateSyncer.fetchNetworkState();
//                 if (await isEmpty(this.networkMutationEventChan)) {
//                     await stateSyncer.updateLocalStateWithRawData(data);
//                     console.log('refresh done');
//                 } else {
//                     console.log(
//                         'refresh discarded because new mutations happened in the mean time',
//                     );
//                 }
//             } else {
//                 console.log('mutation channel is not empty');
//             }
//             const event = await this.networkMutationEventChan.pop();
//             if (event === undefined) {
//                 return;
//             }
//             await this.mutateNetworkState(event);
//             console.log(event.type, 'done');
//         }
//     }
// }


