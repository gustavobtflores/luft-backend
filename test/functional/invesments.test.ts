import CacheUtil from '@src/utils/cache';
import brapiQuotesFixture from '@test/fixtures/brapi_quotes.json';
import * as Transaction from '@src/models/transaction';
import * as UserModel from '@src/models/user';
import nock from 'nock';
import { AuthService } from '@src/services/auth';

describe('Investments data functional tests', () => {
  const defaultUser = {
    email: 'john@email.com',
    name: 'John Doe',
    password: 'password',
  };
  let token: string;
  beforeEach(async () => {
    await CacheUtil.clear();
    await Transaction.remove();
    await UserModel.remove();
    const user = await UserModel.create(defaultUser);
    token = AuthService.generateToken(user);

    const defaultTransaction = {
      ticker: 'ROXO34',
      price: 7.25,
      quantity: 8,
      tickerType: 'bdr',
      type: 'buy',
      date: '01/02/2024',
      userId: user.id,
    } as const;

    await Transaction.create({ ...defaultTransaction, userId: user.id });
  });

  it('should return investments data', async () => {
    nock('https://brapi.dev:443', { encodedQueryParams: true })
      .get('/api/quote/ROXO34')
      .reply(200, brapiQuotesFixture, ['Content-Type', 'application/json']);
    const { body, status } = await global.testRequest
      .get('/investments')
      .set({ 'x-access-token': token });

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

    const { status } = await global.testRequest
      .get('/investments')
      .set({ 'x-access-token': token });

    expect(status).toBe(500);
  });
});
