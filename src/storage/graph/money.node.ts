import { Money } from '@core/entity/money';

import { MoneyState } from '../states/money.state';

export class MoneyNode implements Money {
    constructor(private money: MoneyState) {}

    public get amount(): number {
        return this.money.amount;
    }

    public get currency(): string {
        return this.money.currency;
    }
}
