// utils/currency.js
export const formatCurrency = (amount, currency = 'EUR', locale = 'en-GB') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(amount));
  };
  