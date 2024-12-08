import { Brapi } from '@src/clients/brapi';
import brapiQuotesNormalizedFixture from '@test/fixtures/brapi_quotes_normalized.json';
import brapiCryptoNormalizedFixture from '@test/fixtures/brapi_cryptos_normalized.json';
import investmentsTransactionsFixture from '@test/fixtures/investments_transactions.json';
import {
  Investments,
  InvestmentsProcessingInternalError,
} from '../investments';
import { Transaction } from '@src/models/transaction';

jest.mock('@src/clients/brapi');

describe('Investments service', () => {
  const mockedBrapiService = new Brapi() as jest.Mocked<Brapi>;

  it('should return investments data for a list of transactions', async () => {
    mockedBrapiService.fetchPrices.mockResolvedValue([
      ...brapiQuotesNormalizedFixture,
      ...brapiCryptoNormalizedFixture,
    ]);

    const transactions = investmentsTransactionsFixture as Transaction[];

    const expectedResponse = [
      {
        appreciation: 5,
        appreciationPercent: 0.13793103448275862,
        avgPrice: 7.25,
        currentPrice: 8.25,
        logoUrl: 'https://s3-symbol-logo.tradingview.com/nu-holdings--big.svg',
        quantity: 5,
        ticker: 'ROXO34',
        tickerType: 'bdr',
        total: 41.25,
        totalCost: 72.5,
        totalPurchased: 10,
      },
      {
        appreciation: 211567.705625,
        appreciationPercent: 1.7630642135416668,
        avgPrice: 120000,
        currentPrice: 331567.705625,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
        quantity: 1,
        ticker: 'BTC',
        tickerType: 'crypto',
        total: 331567.705625,
        totalCost: 120000,
        totalPurchased: 1,
      },
    ];

    const investments = new Investments(mockedBrapiService);
    const holdingsWithTransactionsData =
      await investments.processInvestmentsForTransactions(transactions);

    expect(holdingsWithTransactionsData).toEqual(expectedResponse);
  });

  it('should return an empty list when the transactions array is empty', async () => {
    const investments = new Investments();
    const response = await investments.processInvestmentsForTransactions([]);

    expect(response).toEqual([]);
  });

  it('should throw internal processing error when something goes wrong with processInvestmentsForTransactions function', async () => {
    const transactions: Transaction[] =
      investmentsTransactionsFixture as Transaction[];

    mockedBrapiService.fetchPrices.mockRejectedValue('Error fetching data');

    const investments = new Investments(mockedBrapiService);
    await expect(
      investments.processInvestmentsForTransactions(transactions)
    ).rejects.toThrow(InvestmentsProcessingInternalError);
  });
});
