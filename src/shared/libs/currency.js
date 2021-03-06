export const getCurrencySymbol = (currency) => {
    switch (currency) {
        case 'USD':
            return '$';
        case 'GBP':
            return '£';
        case 'EUR':
            return '€';
        case 'AUD':
            return '$';
        case 'BTC':
            return '₿';
        case 'ETH':
            return 'Ξ';
        case 'ARS':
            return '$';
        case 'BGN':
            return 'лв';
        case 'BRL':
            return 'R$';
        case 'CAD':
            return '$';
        case 'CHF':
            return 'CHF';
        case 'CNY':
            return '¥';
        case 'CZK':
            return 'Kč';
        case 'DKK':
            return 'kr';
        case 'HKD':
            return '$';
        case 'HRK':
            return 'kn';
        case 'HUF':
            return 'Ft';
        case 'IDR':
            return 'Rp';
        case 'ILS':
            return '₪';
        case 'INR':
            return '₹';
        case 'JPY':
            return '¥';
        case 'KRW':
            return '₩';
        case 'MXN':
            return '$';
        case 'MYR':
            return 'RM';
        case 'NOK':
            return 'kr';
        case 'NZD':
            return '$';
        case 'PHP':
            return '₱';
        case 'PLN':
            return 'zł';
        case 'RON':
            return 'RON';
        case 'RUB':
            return '₽';
        case 'SEK':
            return 'kr';
        case 'SGD':
            return '$';
        case 'THB':
            return '฿';
        case 'TRY':
            return '₺';
        case 'ZAR':
            return 'R';
    }
};
/**
 * Returns fiat balance
 * @param {number} balance
 * @param {number} usdPrice
 * @param {number} conversionRate
 */
export const getFiatBalance = (balance, usdPrice, conversionRate) => {
    return ((balance * usdPrice) / 1000000) * conversionRate;
};

export const availableCurrencies = [
    'USD',
    'GBP',
    'EUR',
    'AUD',
    'BGN',
    'BRL',
    'CAD',
    'CHF',
    'CNY',
    'CZK',
    'DKK',
    'HKD',
    'HRK',
    'HUF',
    'IDR',
    'ILS',
    'INR',
    'ISK',
    'JPY',
    'KRW',
    'MXN',
    'MYR',
    'NOK',
    'NZD',
    'PHP',
    'PLN',
    'RON',
    'RUB',
    'SEK',
    'SGD',
    'THB',
    'TRY',
    'ZAR',
];
