export type Currency = 'USD';

export interface Money {
    currency: Currency;
    amount: number;
}

export const getLocalCurrency = (): Currency => {
    // TODO: Implement logic to get the local currency
    return 'USD';
};
