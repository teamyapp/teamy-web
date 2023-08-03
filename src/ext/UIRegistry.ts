interface TaskIdAction {
    key: string;
    readableName: string;
    execute: (taskId: number) => void;
}

export class UIRegistry {
    private _taskIdActions: Record<string, TaskIdAction> = {};

    public get taskIdActions() {
        return this._taskIdActions;
    }

    public registerTaskIdAction(action: TaskIdAction) {
        this._taskIdActions[action.key] = action;
    }

    public unregisterTaskIdAction(key: string) {
        delete this._taskIdActions[key];
    }
}
