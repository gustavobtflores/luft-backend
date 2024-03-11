import { InternalError } from '@src/utils/errors/internal-error';
import { AxiosError, AxiosStatic } from 'axios';
import config, { IConfig } from 'config';

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

export interface Asset {
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketTime: string;
  regularMarketPrice: number;
  symbol: string;
  logourl: string;
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

export class Brapi {
  private baseURL = brapiResourceConfig.get<string>('apiUrl');
  private requestTickersAmountLimit = 10;

  constructor(protected http: AxiosStatic) {}

  public async fetchQuotes(tickers: string[]): Promise<Asset[]> {
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

      if (axiosError.response && axiosError.response.status) {
        throw new BrapiRequestError(
          `Error: ${JSON.stringify(axiosError.response.data)} Code: ${axiosError.response.status}`
        );
      }

      throw new ClientRequestError((err as Error).message);
    }
  }

  // public async fetchCryptos(coins: string[]): Promise<{}> {
  //   return Promise.resolve({});
  // }

  private normalizeResponse(quotes: BrapiQuotesResponse): Asset[] {
    return quotes.results
      .filter(this.isValidQuote.bind(this))
      .map(
        ({
          logourl,
          regularMarketChange,
          regularMarketChangePercent,
          regularMarketPrice,
          regularMarketTime,
          symbol,
        }) => ({
          logourl,
          regularMarketChange,
          regularMarketChangePercent,
          regularMarketPrice,
          regularMarketTime,
          symbol,
        })
      );
  }

  private isValidQuote(quote: Partial<BrapiQuote>): boolean {
    return !!(
      quote.logourl &&
      quote.regularMarketChange &&
      quote.regularMarketChangePercent &&
      quote.regularMarketPrice &&
      quote.regularMarketTime &&
      quote.symbol
    );
  }
}
