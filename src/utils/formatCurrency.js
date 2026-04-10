'use strict';

function formatCurrency(cents, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

function dollarsToCents(dollars) {
  return Math.round(parseFloat(dollars) * 100);
}

function centsToDollars(cents) {
  return (cents / 100).toFixed(2);
}

module.exports = { formatCurrency, dollarsToCents, centsToDollars };
