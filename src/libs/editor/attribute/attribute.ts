export class Attribute<Value> {
    constructor(
        private _name: string,
        private value: Value,
        private defaultValue: Value,
        private valueEquals: (curr: Value, other: Value) => boolean,
    ) {}

    name(): string {
        return this._name;
    }

    getValue(): Value {
        return this.value;
    }

    setValue(value: Value): void {
        this.value = value;
    }

    tryMerge(other: Attribute<Value>): Attribute<Value> | undefined {
        if (this._name !== other._name) {
            return undefined;
        }

        if (this.valueEquals(this.value, other.value)) {
            return this.clone();
        }

        return new Attribute<Value>(
            this._name,
            this.defaultValue,
            this.defaultValue,
            this.valueEquals,
        );
    }

    equals(other: Attribute<Value>): boolean {
        if (this._name !== other._name) {
            return false;
        }

        return this.valueEquals(this.value, other.value);
    }

    clone(): Attribute<Value> {
        return new Attribute<Value>(
            this._name,
            this.value,
            this.defaultValue,
            this.valueEquals,
        );
    }
}
