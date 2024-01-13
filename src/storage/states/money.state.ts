export class MoneyState {
    public constructor(public amount: number, public currency: string) {}

    public static fromMutationPayload(json: any): MoneyState {
        return new MoneyState(json.Amount, json.Currency);
    }

    public static fromJson(json: any): MoneyState {
        return new MoneyState(json.amount, json.currency);
    }
}
