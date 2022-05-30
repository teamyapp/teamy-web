import { LocalStore } from '@lib/store/localStore';

import * as events from '@core/event/mutation';
import { mutateState } from '@core/state/mutators';
import { IAppState, initialState } from '@core/state/state';

export function createStore(): LocalStore<IAppState, events.MutationEvent> {
    return new LocalStore<IAppState, events.MutationEvent>(
        initialState,
        mutateState,
    );
}
