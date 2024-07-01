import { Currency, Money } from '@core/entity/money';

export class MoneyNode implements Money {
    constructor(
        private _amount: number,
        private _currency: Currency,
    ) {}

    public get amount(): number {
        return this._amount;
    }

    public get currency(): Currency {
        return this._currency;
    }
}
