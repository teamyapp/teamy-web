export type Currency = 'USD';

export interface Money {
    currency: Currency;
    amount: number;
}

export const getLocalCurrency = (): Currency => {
    // TODO: Get local currency using IP address
    return 'USD';
};
