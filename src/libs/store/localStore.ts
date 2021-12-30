import * as csp from '@creatcodebuild/csp';
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
    private readonly mutationChan = csp.chan<MutationEvent>();

    private readonly stateChangeChan = csp.chan<State>();
    private readonly stateChangeCaster: csp.Multicaster<State | undefined> =
        csp.multi(this.stateChangeChan);
    private readonly stateChangeMonitorChain = this.stateChangeCaster.copy();

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

        this.startProcessingEvents();
    }

    public async mutate(event: MutationEvent): Promise<void> {
        await this.mutationChan.put(event);
        await this.stateChangeMonitorChain;
    }

    public getState(): State {
        return this.currentState;
    }

    public subscribeStateChange(): csp.PopChannel<State> {
        return this.stateChangeCaster.copy();
    }

    private startProcessingEvents() {
        (async () => {
            while (true) {
                const event = await this.mutationChan.pop();
                if (!event) {
                    return;
                }

                this.events.push(event);
                this.currentState = this.mutateState(this.currentState, event);
                console.log(`performed local mutation: ${event.type}`);
                this.persistData();
                await this.stateChangeChan.put(this.currentState);
            }
        })();
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
