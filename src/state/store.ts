import * as events from '@entity/events';
import { mutateState } from '@state/mutators';
import { IAppState, initialState } from '@state/state';
import { LocalStore } from '@lib/store/localStore';

export function createStore(): LocalStore<IAppState, events.MutationEvent> {
    return new LocalStore<IAppState, events.MutationEvent>(
        initialState,
        mutateState,
    );
}
