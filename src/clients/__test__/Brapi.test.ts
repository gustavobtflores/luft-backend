import { Brapi } from '@src/clients/brapi';

import brapiQuotesFixture from '@test/fixtures/brapi_quotes.json';
import brapiQuotesNormalizedFixture from '@test/fixtures/brapi_quotes_normalized.json';

import * as HTTPUtil from '@src/utils/request';

jest.mock('@src/utils/request');

describe('Brapi client', () => {
  const MockedRequestClass = HTTPUtil.Request as jest.Mocked<
    typeof HTTPUtil.Request
  >;
  const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;

  it('should return the normalized assets quotation from the Brapi service', async () => {
    const tickers = ['ROXO34', 'INBR32'];

    mockedRequest.get.mockResolvedValue({
      data: brapiQuotesFixture,
    } as HTTPUtil.Response);

    const brapi = new Brapi(mockedRequest);
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

    mockedRequest.get.mockResolvedValue({
      data: incompleteResponse,
    } as HTTPUtil.Response);

    const brapi = new Brapi(mockedRequest);
    const response = await brapi.fetchQuotes(tickers);
    expect(response).toEqual([]);
  });

  it('should get a generic error from Brapi client when the request fail before reaching the service', async () => {
    const tickers = ['ROXO34', 'INBR32'];
    mockedRequest.get.mockRejectedValue({ message: 'Network Error' });

    const brapi = new Brapi(mockedRequest);

    await expect(brapi.fetchQuotes(tickers)).rejects.toThrow(
      'Unexpected error when trying to communicate to Brapi: Network Error'
    );
  });

  it('should get an BrapiResponseError when the Brapi service responds with error', async () => {
    const tickers = ['ROXO34', 'INBR32'];

    MockedRequestClass.isRequestError.mockReturnValue(true);
    mockedRequest.get.mockRejectedValue({
      response: {
        status: 402,
        data: {
          error: true,
          message:
            'Você atingiu o limite de requisições para o seu plano. Por favor, considere fazer um upgrade para um plano melhor em brapi.dev/dashboard',
        },
      },
    });

    const brapi = new Brapi(mockedRequest);

    await expect(brapi.fetchQuotes(tickers)).rejects.toThrow(
      'Unexpected error returned by Brapi service: Error: {"error":true,"message":"Você atingiu o limite de requisições para o seu plano. Por favor, considere fazer um upgrade para um plano melhor em brapi.dev/dashboard"} Code: 402'
    );
  });
});
