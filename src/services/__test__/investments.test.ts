import { Brapi } from '@src/clients/brapi';
import brapiQuotesNormalizedFixture from '@test/fixtures/brapi_quotes_normalized.json';
import {
  Investments,
  InvestmentsProcessingInternalError,
  TickerType,
  Transaction,
} from '../investments';

jest.mock('@src/clients/brapi');

describe('Investments service', () => {
  const mockedBrapiService = new Brapi() as jest.Mocked<Brapi>;

  it('should return investments data for a list of transactions', async () => {
    /* para usar o método fetchQuotes precisaria instanciar a classe com new (por conta do acesso ao this), 
    por isso a alteração com o prototype que permite substituir o método sem instanciar a classe */
    mockedBrapiService.fetchPrices.mockResolvedValue(
      brapiQuotesNormalizedFixture
    );

    const transactions: Transaction[] = [
      {
        ticker: 'ROXO34',
        tickerType: TickerType.bdr,
        avgPrice: 7.25,
        quantity: 10,
        user: 'some-id',
      },
    ];

    const expectedResponse = [
      {
        avgPrice: 7.25,
        quantity: 10,
        ticker: 'ROXO34',
        tickerType: 'bdr',
        currentPrice: 8.25,
        currentChange: 0.21000004,
        currentChangePercent: 2.6119406,
        logoUrl: 'https://s3-symbol-logo.tradingview.com/nu-holdings--big.svg',
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
        avgPrice: 7.25,
        quantity: 10,
        user: 'some-id',
      },
    ];

    mockedBrapiService.fetchPrices.mockRejectedValue('Error fetching data');

    const investments = new Investments(mockedBrapiService);
    await expect(
      investments.processInvestmentsForTransactions(transactions)
    ).rejects.toThrow(InvestmentsProcessingInternalError);
  });
});
