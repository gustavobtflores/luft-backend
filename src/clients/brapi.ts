import { InternalError } from '@src/utils/errors/internal-error';
import config, { IConfig } from 'config';
import * as HTTPUtil from '@src/utils/request';
import { AxiosError } from 'axios';

export interface BrapiQuote {
  readonly currency: string;
  readonly twoHundredDayAverage: number;
  readonly twoHundredDayAverageChange: number;
  readonly twoHundredDayAverageChangePercent: number;
  readonly marketCap: number;
  readonly shortName: string;
  readonly longName: string;
  readonly regularMarketChange: number;
  readonly regularMarketChangePercent: number;
  readonly regularMarketTime: string;
  readonly regularMarketPrice: number;
  readonly regularMarketDayHigh: number;
  readonly regularMarketDayRange: string;
  readonly regularMarketDayLow: number;
  readonly regularMarketVolume: number;
  readonly regularMarketPreviousClose: number;
  readonly regularMarketOpen: number;
  readonly averageDailyVolume3Month: number;
  readonly averageDailyVolume10Day: number;
  readonly fiftyTwoWeekLowChange: number;
  readonly fiftyTwoWeekLowChangePercent: number;
  readonly fiftyTwoWeekRange: string;
  readonly fiftyTwoWeekHighChange: number;
  readonly fiftyTwoWeekHighChangePercent: number;
  readonly fiftyTwoWeekLow: number;
  readonly fiftyTwoWeekHigh: number;
  readonly symbol: string;
  readonly priceEarnings: number;
  readonly earningsPerShare: number;
  readonly logourl: string;
}

export interface BrapiQuotesResponse {
  results: BrapiQuote[];
  took: string;
  requestedAt: string;
}

export interface Price {
  currentPrice: number;
  ticker: string;
  logoUrl: string;
}

export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage = `Unexpected error when trying to communicate to Brapi`;
    super(`${internalMessage}: ${message}`);
  }
}

export class BrapiRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage = 'Unexpected error returned by Brapi service';
    super(`${internalMessage}: ${message}`);
  }
}

const brapiResourceConfig: IConfig = config.get('App.resources.Brapi');

//TODO: agrupar transações por tipo (crypto, stock) e alterar o service da Brapi pra lidar com isso e também com o limite de 10 tickers por requisição
export class Brapi {
  private baseURL = brapiResourceConfig.get<string>('apiUrl');
  private requestTickersAmountLimit = 10;

  constructor(protected http = new HTTPUtil.Request()) {}

  public async fetchPrices(tickers: string[]): Promise<Price[]> {
    try {
      const response = await this.http.get<BrapiQuotesResponse>(
        `/quote/${tickers}`,
        {
          baseURL: this.baseURL,
          headers: {
            Authorization: `Bearer ${brapiResourceConfig.get('apiToken')}`,
          },
        }
      );

      return this.normalizeResponse(response.data);
    } catch (err) {
      const axiosError = err as AxiosError;

      if (HTTPUtil.Request.isRequestError(axiosError)) {
        throw new BrapiRequestError(
          `Error: ${JSON.stringify(axiosError?.response?.data)} Code: ${axiosError?.response?.status}`
        );
      }

      throw new ClientRequestError((err as Error).message);
    }
  }

  private normalizeResponse(quotes: BrapiQuotesResponse): Price[] {
    return quotes.results
      .filter(this.isValidQuote.bind(this))
      .map(({ logourl, regularMarketPrice, symbol }) => ({
        logoUrl: logourl,
        currentPrice: regularMarketPrice,
        ticker: symbol,
      }));
  }

  private isValidQuote(quote: Partial<BrapiQuote>): boolean {
    return !!(quote.logourl && quote.regularMarketPrice && quote.symbol);
  }
}
