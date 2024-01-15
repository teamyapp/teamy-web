import { Currency } from './currency';

export class MoneyState {
    public constructor(public amount: number, public currency: Currency) {}

    public static fromMutationPayload(json: any): MoneyState {
        return new MoneyState(json.Amount, json.Currency);
    }

    public static fromJson(json: any): MoneyState {
        return new MoneyState(json.amount, json.currency);
    }
}
