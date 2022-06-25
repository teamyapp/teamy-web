import { Attributes } from '@lib/storage/mutation';

import { toDate } from '@core/statev2/parser';

class CompositeKey {
    constructor(public awaitingTaskId: number, public awaitForTaskId: number) {}

    public toString(): string {
        return [this.awaitingTaskId, this.awaitForTaskId].join(',');
    }

    public static parse(key: string): CompositeKey {
        const fields = key.split(',');
        return {
            awaitingTaskId: parseInt(fields[0]),
            awaitForTaskId: parseInt(fields[1]),
        };
    }
}

export class TaskAwaitForRelationState {
    private compositeKey: CompositeKey;

    constructor(
        public awaitingTaskId: number,
        public awaitForTaskId: number,
        public createdAt: Date,
    ) {
        this.compositeKey = new CompositeKey(
            this.awaitingTaskId,
            this.awaitForTaskId,
        );
    }

    get key(): string {
        return this.compositeKey.toString();
    }

    public static parseCompositeKey(key: string): CompositeKey {
        return CompositeKey.parse(key);
    }

    public static fromAttributes(
        attributes: Attributes,
    ): TaskAwaitForRelationState {
        return new TaskAwaitForRelationState(
            parseInt(attributes.AwaitingTaskID),
            parseInt(attributes.AwaitForTaskID),
            toDate(attributes.CreatedAt)!,
        );
    }

    public static fromJson(json: any): TaskAwaitForRelationState {
        return new TaskAwaitForRelationState(
            json.awaitingTaskId,
            json.awaitForTaskId,
            toDate(json.createdAt)!,
        );
    }
}
