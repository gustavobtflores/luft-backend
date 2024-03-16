import { Brapi } from '@src/clients/brapi';
import brapiQuotesNormalizedFixture from '@test/fixtures/brapi_quotes_normalized.json';
import {
  Investments,
  InvestmentsProcessingInternalError,
} from '../investments';
import {
  TickerType,
  Transaction,
  TransactionType,
} from '@src/models/transaction';

jest.mock('@src/clients/brapi');

describe('Investments service', () => {
  const mockedBrapiService = new Brapi() as jest.Mocked<Brapi>;

  it('should return investments data for a list of transactions', async () => {
    mockedBrapiService.fetchPrices.mockResolvedValue(
      brapiQuotesNormalizedFixture
    );

    const transactions = [
      {
        ticker: 'ROXO34',
        tickerType: TickerType.bdr,
        quantity: 10,
        price: 7.25,
        type: TransactionType.buy,
        userId: '497dfbe3-6fbb-4f88-aae7-0e385589a623',
      },
      {
        ticker: 'ROXO34',
        tickerType: TickerType.bdr,
        quantity: 5,
        price: 10,
        type: TransactionType.sell,
        userId: '497dfbe3-6fbb-4f88-aae7-0e385589a623',
      },
    ];

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
        total: 36.25,
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
    const transactions: Transaction[] = [
      {
        ticker: 'ROXO34',
        tickerType: TickerType.bdr,
        quantity: 10,
        price: 10.9,
        type: 'buy',
        userId: '497dfbe3-6fbb-4f88-aae7-0e385589a623',
      },
    ];

    mockedBrapiService.fetchPrices.mockRejectedValue('Error fetching data');

    const investments = new Investments(mockedBrapiService);
    await expect(
      investments.processInvestmentsForTransactions(transactions)
    ).rejects.toThrow(InvestmentsProcessingInternalError);
  });
});
