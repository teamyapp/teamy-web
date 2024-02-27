export type Currency = 'USD';

export interface Money {
    currency: Currency;
    amount: number;
}

export const getLocalCurrency = (): Currency => {
    return 'USD';
};
