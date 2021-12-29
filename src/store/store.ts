import * as csp from '@creatcodebuild/csp';
import { Event } from '@entity/events';

const stateKey = 'appState';

export type MutateState<State, MutationEvent> = (
    state: State,
    event: MutationEvent,
) => State;

export class LocalStore<State, MutationEvent extends Event> {
    private readonly states: State[];
    private readonly mutateState: MutateState<State, MutationEvent>;

    private readonly stateChangeChan = csp.chan<State>();
    private readonly stateChangeCaster: csp.Multicaster<State | undefined> =
        csp.multi(this.stateChangeChan);

    constructor(
        initialState: State,
        mutateState: MutateState<State, MutationEvent>,
    ) {
        this.mutateState = mutateState;
        const value = localStorage.getItem(stateKey);
        if (value) {
            this.states = JSON.parse(value);
        } else {
            this.states = [initialState];
        }
    }

    public mutate(event: MutationEvent) {
        if (this.states.length < 1) {
            console.log('cannot mutate state');
            return;
        }

        this.states.push(this.mutateState(this.getState(), event));
        this.stateChangeChan.put(this.getState());
        console.log(`performed local mutation: ${event.type}`);
        this.persistState();
    }

    public undo() {
        if (this.states.length < 2) {
            console.log('cannot undo state mutation');
            return;
        }
        this.states.pop();
        this.persistState();
    }

    public getState(): State {
        return this.states[this.states.length - 1];
    }

    public subscribeStateChange(): csp.PopChannel<State> {
        return this.stateChangeCaster.copy();
    }

    private persistState() {
        localStorage.setItem(
            stateKey,
            JSON.stringify(this.getState(), null, 4),
        );
    }
}
