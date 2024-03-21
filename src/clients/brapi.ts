import { InternalError } from '@src/utils/errors/internal-error';
import config, { IConfig } from 'config';
import * as HTTPUtil from '@src/utils/request';
import { AxiosError, AxiosResponse } from 'axios';

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
}

export interface BrapiCrypto {
  currency: string;
  currencyRateFromUSD: number;
  coinName: string;
  coin: string;
  regularMarketChange: number;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  regularMarketDayLow: number;
  regularMarketDayHigh: number;
  regularMarketDayRange: string;
  regularMarketVolume: number;
  marketCap: number;
  regularMarketTime: string;
  coinImageUrl: string;
}

export interface BrapiCryptoResponse {
  coins: BrapiCrypto[];
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

export class Brapi {
  private baseURL = brapiResourceConfig.get<string>('apiUrl');
  private requestTickersAmountLimit = 10;

  constructor(protected http = new HTTPUtil.Request()) {}

  public async fetchStocks(tickers: string[]): Promise<Price[]> {
    if (tickers.length === 0) return [];

    try {
      const stockPromises = this.createPromisesBasedLimit<
        AxiosResponse<BrapiQuotesResponse>
      >(tickers, (tickers) =>
        this.http.get(`/quote/${tickers.join(',')}`, {
          baseURL: this.baseURL,
          headers: {
            Authorization: `Bearer ${brapiResourceConfig.get('apiToken')}`,
          },
        })
      );

      const response =
        await Promise.all<AxiosResponse<BrapiQuotesResponse>>(stockPromises);

      return this.normalizeStocksResponse(
        response.map(({ data }) => data.results).flat()
      );
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

  public async fetchCrypto(cryptos: string[]) {
    if (cryptos.length === 0) return [];

    const cryptoPromises = this.createPromisesBasedLimit(cryptos, (coins) =>
      this.http.get<BrapiCryptoResponse>(`/v2/crypto?coin=${coins.join(',')}`, {
        baseURL: this.baseURL,
        headers: {
          Authorization: `Bearer ${brapiResourceConfig.get('apiToken')}`,
        },
      })
    );

    const response =
      await Promise.all<AxiosResponse<BrapiCryptoResponse>>(cryptoPromises);

    return this.normalizeCryptosResponse(
      response.map(({ data }) => data.coins).flat()
    );
  }

  private normalizeStocksResponse(quotes: BrapiQuote[]): Price[] {
    return quotes.filter(this.isValidQuote.bind(this)).map((quote) => ({
      logoUrl: quote.logourl,
      currentPrice: quote.regularMarketPrice,
      ticker: quote.symbol,
    }));
  }

  private normalizeCryptosResponse(coins: BrapiCrypto[]): Price[] {
    return coins.filter(this.isValidCrypto.bind(this)).map((coin) => ({
      logoUrl: coin.coinImageUrl,
      currentPrice: coin.regularMarketPrice,
      ticker: coin.coin,
    }));
  }

  private isValidQuote(quote: Partial<BrapiQuote>): boolean {
    return !!(quote.logourl && quote.regularMarketPrice && quote.symbol);
  }

  private isValidCrypto(crypto: Partial<BrapiCrypto>): boolean {
    return !!(crypto.coinImageUrl && crypto.regularMarketPrice && crypto.coin);
  }

  private createPromisesBasedLimit<T>(
    tickers: string[],
    callback: (tickers: string[]) => Promise<T>
  ): Promise<T>[] {
    const tickersCopy = [...tickers];
    const promises = [];

    while (tickersCopy.length) {
      promises.push(
        callback(tickersCopy.splice(0, this.requestTickersAmountLimit))
      );
    }

    return promises;
  }
}
