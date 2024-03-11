import { Brapi } from '@src/clients/brapi';
import axios from 'axios';

import brapiQuotesFixture from '@test/fixtures/brapi_quotes.json';
import brapiQuotesNormalizedFixture from '@test/fixtures/brapi_quotes_normalized.json';

jest.mock('axios');

describe('Brapi client', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  it('should return the normalized assets quotation from the Brapi service', async () => {
    const tickers = ['ROXO34', 'INBR32'];

    mockedAxios.get.mockResolvedValue({ data: brapiQuotesFixture });

    const brapi = new Brapi(axios);
    const response = await brapi.fetchQuotes(tickers);
    expect(response).toEqual(brapiQuotesNormalizedFixture);
  });

  it('should exclude incomplete data quotes', async () => {
    const tickers = ['ROXO34', 'INBR32'];

    const incompleteResponse = {
      results: [
        {
          regularMarketChange: 0.21000004,
        },
      ],
    };

    mockedAxios.get.mockResolvedValue({ data: incompleteResponse });

    const brapi = new Brapi(axios);
    const response = await brapi.fetchQuotes(tickers);
    expect(response).toEqual([]);
  });

  it('should get a generic error from Brapi client when the request fail before reaching the service', async () => {
    const tickers = ['ROXO34', 'INBR32'];
    mockedAxios.get.mockRejectedValue({ message: 'Network Error' });

    const brapi = new Brapi(axios);

    await expect(brapi.fetchQuotes(tickers)).rejects.toThrow(
      'Unexpected error when trying to communicate to Brapi: Network Error'
    );
  });

  it('should get an BrapiResponseError when the Brapi service responds with error', async () => {
    const tickers = ['ROXO34', 'INBR32'];

    mockedAxios.get.mockRejectedValue({
      response: {
        status: 402,
        data: {
          error: true,
          message:
            'Você atingiu o limite de requisições para o seu plano. Por favor, considere fazer um upgrade para um plano melhor em brapi.dev/dashboard',
        },
      },
    });

    const brapi = new Brapi(axios);

    await expect(brapi.fetchQuotes(tickers)).rejects.toThrow(
      'Unexpected error returned by Brapi service: Error: {"error":true,"message":"Você atingiu o limite de requisições para o seu plano. Por favor, considere fazer um upgrade para um plano melhor em brapi.dev/dashboard"} Code: 402'
    );
  });
});
