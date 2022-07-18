import { PopChannel, chan, multi } from '@lib/csp/csp';

import { AppState } from '@core/storage/states/app.state';

const appStateKey = 'appState';

export class LocalStore {
    private appState: AppState;
    private readonly stateChangeChan = chan<boolean>();
    private readonly stateChangeMulti = multi<boolean>(this.stateChangeChan);

    constructor() {
        const savedState = localStorage.getItem(appStateKey);
        this.appState = savedState
            ? AppState.fromJson(JSON.parse(savedState))
            : new AppState({}, {}, {}, {}, {}, {}, [], [], [], [], {});
    }

    public getState(): AppState {
        return Object.assign({}, this.appState);
    }

    public subscribeStateChange(): PopChannel<boolean | undefined> {
        const chan = this.stateChangeMulti.copy();
        chan.put(true);
        return chan;
    }

    public close() {
        this.stateChangeChan.close();
    }

    public updateState(newState: AppState) {
        this.appState = Object.assign({}, newState);
        this.stateChangeChan.put(true);
        localStorage.setItem(appStateKey, JSON.stringify(this.appState));
    }
}
