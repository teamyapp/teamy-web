import * as csp from '@lib/csp/csp';
import * as event from '@lib/event/event';

const storeDataKey = 'storeData';

export type MutateState<State, MutationEvent> = (
    state: State,
    event: MutationEvent,
) => State;

interface Data<State, MutationEvent> {
    initialState: State;
    currentState: State;
    events: MutationEvent[];
}

export class LocalStore<State, MutationEvent extends event.Event> {
    private readonly initialState: State;
    private readonly events: MutationEvent[];
    private readonly mutateState: MutateState<State, MutationEvent>;
    private readonly stateChangeChan = csp.chan<State>();
    private readonly stateChangeCaster: csp.Multicaster<State | undefined> =
        csp.multi(this.stateChangeChan);

    private currentState: State;

    constructor(
        initialState: State,
        mutateState: MutateState<State, MutationEvent>,
    ) {
        this.mutateState = mutateState;
        const data = this.loadData();

        if (data) {
            this.initialState = data.initialState;
            this.currentState = data.currentState;
            this.events = data.events;
        } else {
            this.currentState = this.initialState = initialState;
            this.events = [];
        }
    }

    public mutate(event: MutationEvent, shouldNotify: boolean = true): State {
        const newState = this.mutateState(this.currentState, event);
        this.events.push(event);
        this.currentState = newState;
        console.log(`performed local mutation: ${event.type}`);
        this.persistData();

        if (shouldNotify) {
            this.stateChangeChan.put(newState);
        }
        return newState;
    }

    public subscribeStateChange(): csp.PopChannel<State> {
        return this.stateChangeCaster.copy();
    }

    public state(): State {
        return this.currentState
    }

    private persistData() {
        const data: Data<State, MutationEvent> = {
            initialState: this.initialState,
            currentState: this.currentState,
            events: this.events,
        };
        localStorage.setItem(storeDataKey, JSON.stringify(data, null, 4));
    }

    private loadData(): Data<State, MutationEvent> | null {
        const data = localStorage.getItem(storeDataKey);
        if (!data) {
            return null;
        } else {
            return JSON.parse(data);
        }
    }
}
