import brapiQuotesFixture from '@test/fixtures/brapi_quotes.json';
import * as Transaction from '@src/models/transaction';
import nock from 'nock';

describe('Investments data functional tests', () => {
  beforeEach(async () => {
    await Transaction.remove();
    const defaultTransaction = {
      ticker: 'ROXO34',
      price: 7.25,
      quantity: 8,
      tickerType: 'bdr',
      type: 'buy',
      date: '01/02/2024',
    } as const;

    await Transaction.create(defaultTransaction);
  });

  it('should return investments data', async () => {
    nock('https://brapi.dev:443', { encodedQueryParams: true })
      .get('/api/quote/ROXO34')
      .reply(200, brapiQuotesFixture, ['Content-Type', 'application/json']);
    const { body, status } = await global.testRequest.get('/investments');

    expect(status).toBe(200);
    expect(body).toEqual([
      {
        ticker: 'ROXO34',
        appreciation: 8,
        appreciationPercent: 0.13793103448275862,
        currentPrice: 8.25,
        quantity: 8,
        avgPrice: 7.25,
        logoUrl: 'https://s3-symbol-logo.tradingview.com/nu-holdings--big.svg',
        tickerType: 'bdr',
        total: 58,
      },
    ]);
  });

  it('should return 500 if something goes wrong during the investments processing', async () => {
    nock('https://brapi.dev:443', { encodedQueryParams: true })
      .get('/api/quote/ROXO34')
      .replyWithError('Something went wrong');
    const { status } = await global.testRequest.get('/investments');

    expect(status).toBe(500);
  });
});
