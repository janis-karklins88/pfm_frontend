// utils/currency.js

/**
 * Format a number as currency according
 * to a given currency code and locale.
 *
 * @param {number|string} amount – the value to format
 * @param {string}       currency – ISO 4217 code (e.g. "USD", "EUR") – **required**
 * @param {string}       [locale=navigator.language]
 *                                    – e.g. "en-GB", "lv-LV"
 * @returns {string} formatted currency string
 */
export function formatCurrency(
  amount,
  currency,
  locale = navigator.language
) {
  const value = Number(amount);
  if (isNaN(value)) {
    console.warn(`formatCurrency: invalid number "${amount}"`);
    return "";
  }
  if (!currency) {
    console.warn("formatCurrency: no currency provided");
    return value.toFixed(2);
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
