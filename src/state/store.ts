import { LocalStore } from '@lib/store/localStore';

import * as events from '@core/entity/events';
import { mutateState } from '@core/state/mutators';
import { IAppState, initialState } from '@core/state/state';

export function createStore(): LocalStore<IAppState, events.MutationEvent> {
    return new LocalStore<IAppState, events.MutationEvent>(
        initialState,
        mutateState,
    );
}
