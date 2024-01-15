import { Currency, Money } from '@core/entity/money';

import { MoneyState } from '../states/money.state';

export class MoneyNode implements Money {
    constructor(private money: MoneyState) {}

    public get amount(): number {
        return this.money.amount;
    }

    public get currency(): Currency {
        return this.money.currency;
    }
}
