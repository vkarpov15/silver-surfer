const dividends = require('./lib/dividends');
const eps = require('./lib/eps');
const fs = require('fs');
const regression = require('regression');

run('SKT').catch(error => console.error(error.stack));

async function run(symbol) {
  console.log('Dividends...');
  const div = fs.existsSync(`./data/dividend/${symbol.toLowerCase()}.html`) ?
    fs.readFileSync(`./data/dividend/${symbol.toLowerCase()}.html`).toString() :
    null;
  const { estimatedNext, estimatedNextPayment, consecutiveQuarters } =
    await dividends(symbol, div);
  console.log('EPS...');

  const e = fs.existsSync(`./data/eps/${symbol.toLowerCase()}.html`) ?
    fs.readFileSync(`./data/eps/${symbol.toLowerCase()}.html`).toString() :
    null;
  const _eps = await eps(symbol, e);
  console.log('Done');

  const trend = regression.linear(_eps.map((eps, i) => ([i, eps.eps]))).
    equation[0];

  console.log(estimatedNext.format('YYYYMMDD'), estimatedNextPayment.format('YYYYMMDD'),
    consecutiveQuarters, trend, _eps.length);
}
