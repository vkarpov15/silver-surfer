const cheerio = require('cheerio');
const moment = require('moment');
const superagent = require('superagent');

const DATE_FORMAT = 'MM-DD-YY';

module.exports = async function eps(symbol, text) {
  symbol = symbol.toUpperCase();
  /*const text = await superagent.
    get(`http://fundamentals.nasdaq.com/redpage.asp?selected=${symbol}&market=NASDAQ-GS`).
    then(res => res.text);*/

  text = text || await superagent.
    get(`http://seekingalpha.com/symbol/${symbol}/earnings`).
    set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36').
    then(res => res.text);
  const $ = cheerio.load(text);

  const cols = $('.earnings-summary .earning-title');

  const epsData = [];
  cols.each((i, col) => {
    const text = $(col).text();

    const date = text.match(/(\d\d-\d\d-\d\d)/)[1];
    const eps = parseFloat(text.match(/EPS of \$(\d+\.\d+)/)[1]);
    epsData.push({ date, eps });
  });

  return epsData;
};
