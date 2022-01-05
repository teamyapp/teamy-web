import * as csp from '@lib/csp/csp';
import * as event from '@lib/event/event';

const storeDataKey = 'storeData';

export type MutateState<State, MutationEvent> = (state: State, event: MutationEvent) => State;

interface Data<State, MutationEvent> {
    initialState: State;
    currentState: State;
    events: MutationEvent[];
}

export class LocalStore<State, MutationEvent extends event.Event> {
    // state values
    private readonly initialState: State;
    private currentState: State;
    private readonly events: MutationEvent[];

    // external dependency
    private readonly mutateState: MutateState<State, MutationEvent>;
    
    // channels
    private readonly stateChangeChan = csp.chan<State>();
    private readonly stateChangeCaster: csp.Multicaster<State | undefined> =
        csp.multi(this.stateChangeChan);
    private readonly mutationEventsChan = csp.chan<MutationEvent>();
    private readonly mutationEventsMultiCaster: csp.Multicaster<MutationEvent | undefined> = 
        csp.multi(this.mutationEventsChan);


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

    public async mutate(event: MutationEvent): Promise<State> {
        console.log(`performed local mutation: ${event.type}`);
        const newState = this.mutateState(this.currentState, event);
        this.events.push(event);
        this.currentState = newState;
        this.persistData();
        await this.stateChangeChan.put(newState);
        await this.mutationEventsChan.put(event);
        return newState;
    }

    public getState(): State {
        return this.currentState;
    }
    public setState(setter: (s: State) => State) {
        // it's all references
        // todo: consider immutable.js or 
        // other structural sharing solutions in the future
        this.currentState = setter(this.currentState); 
        this.persistData();
        this.stateChangeChan.put(this.currentState);
    }

    // If a consumer is interested in the whole state when it changes,
    // should call this function to subscribe
    public subscribeStateChange(): csp.PopChannel<State | undefined> {
        let chan = this.stateChangeCaster.copy();
        // when any consumer first subscribes, populate the current state first.
        chan.put(this.currentState);
        return chan;
    }
    // If a consumer is interested in the individual events that happens to the store,
    // should call this function to subscribe
    public subscribeMutationEvent(): csp.PopChannel<MutationEvent | undefined> {
        return this.mutationEventsMultiCaster.copy();
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
