const cheerio = require('cheerio');
const moment = require('moment');
const superagent = require('superagent');

const DATE_FORMAT = 'M/D/YYYY';

module.exports = async function dividends(symbol, text) {
  symbol = symbol.toLowerCase();
  text = text || await superagent.
    get(`https://www.nasdaq.com/symbol/${symbol}/dividend-history`).
    then(res => res.text);
  const $ = cheerio.load(text);

  const rows = $('#quotes_content_left_dividendhistoryGrid tr');
  const dividends = [];
  rows.each((i, row) => {
    if (i === 0) {
      return;
    }
    let [ex, type, amount, declaration, record, payment] = Array.prototype.slice.
      call($(row).find('td')).
      map(td => $(td).text().trim());

    amount = parseFloat(amount);

    dividends.push({ ex, type, amount, declaration, record, payment });
  });

  return {
    dividends,
    estimatedNext: estimatedNext(dividends.map(d => moment(d.ex, DATE_FORMAT)), symbol),
    estimatedNextPayment: estimatedNext(dividends.map(d => moment(d.payment, DATE_FORMAT)), symbol),
    consecutiveQuarters: consecutiveQuarters(dividends, symbol)
  };
}

const estimatedNext = function(dates) {
  for (let i = 1; i < dates.length; ++i) {
    if (dates[i].isAfter(moment())) {
      return dates[i];
    }
    if (dates[i].add(1, 'year').isBefore(moment())) {
      return dates[i - 1];
    }
  }
  return void 0;
};

function consecutiveQuarters(dividends, symbol) {
  for (let i = 1; i < dividends.length; ++i) {
    if (dividends[i].amount > dividends[i - 1].amount &&
        !(excluded[symbol] || []).includes(dividends[i - 1].ex)) {
      return i;
    }
  }
  return `${dividends.length}+`;
}

const excluded = {
  'ohi': ['4/28/2015', '3/27/2015']
};
