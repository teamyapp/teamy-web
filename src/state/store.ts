import * as events from '@entity/events';
import { LocalStore } from '@lib/store/localStore';
import { mutateState } from '@state/mutators';
import { IAppState, initialState } from '@state/state';

export function createStore(): LocalStore<IAppState, events.MutationEvent> {
    return new LocalStore<IAppState, events.MutationEvent>(
        initialState,
        mutateState,
    );
}
