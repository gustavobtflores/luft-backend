import { Brapi } from '@src/clients/brapi';
import brapiQuotesNormalizedFixture from '@test/fixtures/brapi_quotes_normalized.json';
import {
  Investments,
  InvestmentsProcessingInternalError,
} from '../investments';
import { TickerType, Transaction } from '@src/models/transaction';

jest.mock('@src/clients/brapi');

describe('Investments service', () => {
  const mockedBrapiService = new Brapi() as jest.Mocked<Brapi>;

  it('should return investments data for a list of transactions', async () => {
    mockedBrapiService.fetchPrices.mockResolvedValue(
      brapiQuotesNormalizedFixture
    );

    const transactions: Transaction[] = [
      {
        ticker: 'ROXO34',
        tickerType: TickerType.bdr,
        quantity: 10,
        price: 10,
        type: 'buy',
      },
      {
        ticker: 'ROXO34',
        tickerType: TickerType.bdr,
        quantity: 10,
        price: 20,
        type: 'buy',
      },
      {
        ticker: 'ROXO34',
        tickerType: TickerType.bdr,
        quantity: 5,
        price: 11,
        type: 'sell',
      },
    ];

    const expectedResponse = [
      {
        appreciation: -135,
        appreciationPercent: -0.45,
        avgPrice: 15,
        currentPrice: 8.25,
        logoUrl: 'https://s3-symbol-logo.tradingview.com/nu-holdings--big.svg',
        quantity: 20,
        ticker: 'ROXO34',
        tickerType: 'bdr',
        total: 300,
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
      },
    ];

    mockedBrapiService.fetchPrices.mockRejectedValue('Error fetching data');

    const investments = new Investments(mockedBrapiService);
    await expect(
      investments.processInvestmentsForTransactions(transactions)
    ).rejects.toThrow(InvestmentsProcessingInternalError);
  });
});
