import * as csp from '@creatcodebuild/csp';
import { Event } from '@lib/event/event';

const storeDataKey = 'storeData';

export type MutateState<State, MutationEvent> = (
    state: State,
    event: MutationEvent,
) => State;

interface Data<State, MutationEvent> {
    states: State[];
    events: MutationEvent[];
}

export class LocalStore<State, MutationEvent extends Event> {
    private readonly states: State[];
    private readonly events: MutationEvent[];
    private readonly mutateState: MutateState<State, MutationEvent>;

    private readonly stateChangeChan = csp.chan<State>();
    private readonly stateChangeCaster: csp.Multicaster<State | undefined> =
        csp.multi(this.stateChangeChan);

    constructor(
        initialState: State,
        mutateState: MutateState<State, MutationEvent>,
    ) {
        this.mutateState = mutateState;
        const data = this.loadData();
        this.states = data.states.length === 0 ? [initialState] : data.states;
        this.events = data.events;
    }

    public mutate(event: MutationEvent) {
        if (this.states.length < 1) {
            console.log('cannot mutate state');
            return;
        }

        this.events.push(event);
        this.states.push(this.mutateState(this.getState(), event));
        this.stateChangeChan.put(this.getState());
        console.log(`performed local mutation: ${event.type}`);
        this.persistData();
    }

    public undo() {
        if (this.states.length < 2) {
            console.log('cannot undo state mutation');
            return;
        }
        this.states.pop();
        this.persistData();
    }

    public getState(): State {
        return this.states[this.states.length - 1];
    }

    public subscribeStateChange(): csp.PopChannel<State> {
        return this.stateChangeCaster.copy();
    }

    private persistData() {
        const data: Data<State, MutationEvent> = {
            states: this.states,
            events: this.events,
        };
        localStorage.setItem(storeDataKey, JSON.stringify(data, null, 4));
    }

    private loadData(): Data<State, MutationEvent> {
        const data = localStorage.getItem(storeDataKey);
        if (!data) {
            return {
                states: [],
                events: [],
            };
        } else {
            return JSON.parse(localStorage.getItem(storeDataKey) || '');
        }
    }
}
